const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- In-memory demo data ---------------- //

let users = [];
let orders = [];
let contactMessages = [];
let reviews = [];

// Simple dishes catalog for demo purposes
const dishes = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella and basil.',
    rate: 9.99,
    category: 'Italian',
    imageUrl: '/images/italian/margherita.jpg',
  },
  {
    id: '2',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces.',
    rate: 12.5,
    category: 'Indian',
    imageUrl: '/images/indian/butter-chicken.jpg',
  },
  {
    id: '3',
    name: 'Tacos al Pastor',
    description: 'Mexican tacos with marinated pork and pineapple.',
    rate: 8.75,
    category: 'Mexican',
    imageUrl: '/images/mexican/tacos-al-pastor.jpg',
  },
  {
    id: '4',
    name: 'Kung Pao Chicken',
    description: 'Spicy stir-fried Chinese dish with chicken and peanuts.',
    rate: 11.0,
    category: 'Chinese',
    imageUrl: '/images/chinese/kung-pao-chicken.jpg',
  },
  {
    id: '5',
    name: 'Bibimbap',
    description: 'Korean mixed rice bowl with veggies, beef, and egg.',
    rate: 10.5,
    category: 'Korean',
    imageUrl: '/images/korean/bibimbap.jpg',
  },
  {
    id: '6',
    name: 'Pad Thai',
    description: 'Thai stir-fried rice noodles with tamarind sauce.',
    rate: 9.5,
    category: 'Thai',
    imageUrl: '/images/thai/pad-thai.jpg',
  },
  {
    id: '7',
    name: 'Cheeseburger',
    description: 'American-style grilled beef burger with cheese.',
    rate: 8.0,
    category: 'American',
    imageUrl: '/images/american/cheeseburger.jpg',
  },
];

// ---------------- Helpers & middleware ---------------- //

function generateToken(user) {
  return jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const user = users.find(u => u.id === payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found for token' });
    }
    req.user = user;
    next();
  });
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function calculateCartTotals(items) {
  let total = 0;
  const detailedItems = items.map(item => {
    const dish = dishes.find(d => d.id === String(item.dishId));
    if (!dish) {
      return null;
    }
    const quantity = Number(item.quantity) || 1;
    const itemTotal = dish.rate * quantity;
    total += itemTotal;
    return {
      dishId: dish.id,
      name: dish.name,
      rate: dish.rate,
      quantity,
      itemTotal,
    };
  });

  if (detailedItems.includes(null)) {
    return null;
  }

  return { items: detailedItems, totalAmount: Number(total.toFixed(2)) };
}

// ---------------- Health ---------------- //

// Health check endpoint for uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ---------------- Auth & Users ---------------- //

// Register new user
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      phone: '',  // Initialize phone field for future profile updates
      passwordHash,
      favorites: [],
    };
    users.push(newUser);

    const token = generateToken(newUser);
    res.status(201).json({ user: publicUser(newUser), token });
  } catch (err) {
    next(err);
  }
});

// Login existing user
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
});

// Get current authenticated user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// Get profile
app.get('/api/users/me', authenticateToken, (req, res) => {
  res.json(publicUser(req.user));
});

// Update profile (name, email, phone, password)
app.put('/api/auth/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    
    console.log('Update profile request received for user:', req.user?.id);
    console.log('Request body:', { name, email, phone, hasCurrentPassword: !!currentPassword, hasNewPassword: !!newPassword });

    // Validate required fields
    if (!name || !email) {
      console.log('Missing required fields - name or email');
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Phone is optional but if provided must be valid
    const phoneToUpdate = phone || '';
    if (phone && phone.length < 10) {
      console.log('Invalid phone number length');
      return res.status(400).json({ error: 'Phone number must be at least 10 digits if provided' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        console.log('New password provided but no current password');
        return res.status(400).json({ error: 'Current password is required to set new password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
      if (!isMatch) {
        console.log('Current password does not match');
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      req.user.passwordHash = await bcrypt.hash(newPassword, 10);
      console.log('Password updated');
    }

    // Update profile
    req.user.name = name;
    req.user.email = email;
    req.user.phone = phoneToUpdate;
    
    console.log('Profile updated successfully for user:', req.user?.id);

    res.json({
      message: 'Profile updated successfully',
      user: publicUser(req.user)
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update profile (name only for now; extend as needed)
app.put('/api/users/me', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  req.user.name = name;
  res.json(publicUser(req.user));
});

// ---------------- Dishes & Categories ---------------- //

app.get('/api/dishes', (req, res) => {
  res.json(dishes);
});

app.get('/api/dishes/:id', (req, res) => {
  const dish = dishes.find(d => d.id === req.params.id);
  if (!dish) {
    return res.status(404).json({ error: 'Dish not found' });
  }
  res.json(dish);
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(dishes.map(d => d.category))];
  res.json(categories);
});

app.get('/api/categories/:category/dishes', (req, res) => {
  const category = req.params.category.toLowerCase();
  const filtered = dishes.filter(d => d.category.toLowerCase() === category);
  res.json(filtered);
});

// ---------------- Cart & Orders ---------------- //

// Validate cart: recalculates totals from official dish prices
app.post('/api/cart/validate', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }
  const result = calculateCartTotals(items);
  if (!result) {
    return res.status(400).json({ error: 'One or more dishes not found' });
  }
  res.json(result);
});

// Create an order from cart (authenticated)
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, address } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const totals = calculateCartTotals(items);
  if (!totals) {
    return res.status(400).json({ error: 'One or more dishes not found' });
  }

  const order = {
    id: String(orders.length + 1),
    userId: req.user.id,
    items: totals.items,
    totalAmount: totals.totalAmount,
    address: address || null,
    status: 'PLACED',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);

  res.status(201).json(order);
});

// List current user's orders
app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.user.id);
  res.json(userOrders);
});

// Get single order (only if it belongs to the user)
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const order = orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// ---------------- Contact / Support ---------------- //

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }
  const contact = {
    id: String(contactMessages.length + 1),
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  };
  contactMessages.push(contact);
  res.status(201).json({ success: true });
});

// NOTE: These are simple demo endpoints; in real apps protect this with admin auth
app.get('/api/admin/contact-messages', (req, res) => {
  res.json(contactMessages);
});

// List all orders (admin/demo)
app.get('/api/admin/orders', (req, res) => {
  res.json(orders);
});

// ---------------- Favorites ---------------- //

// Add dish to favorites
app.post('/api/favorites/:dishId', authenticateToken, (req, res) => {
  const dishId = req.params.dishId;
  const dish = dishes.find(d => d.id === dishId);
  if (!dish) {
    return res.status(404).json({ error: 'Dish not found' });
  }
  if (!req.user.favorites.includes(dishId)) {
    req.user.favorites.push(dishId);
  }
  res.json({ favorites: req.user.favorites });
});

// Remove dish from favorites
app.delete('/api/favorites/:dishId', authenticateToken, (req, res) => {
  const dishId = req.params.dishId;
  req.user.favorites = req.user.favorites.filter(id => id !== dishId);
  res.json({ favorites: req.user.favorites });
});

// Get all favorite dishes for current user
app.get('/api/favorites', authenticateToken, (req, res) => {
  const favoriteDishes = dishes.filter(d => req.user.favorites.includes(d.id));
  res.json(favoriteDishes);
});

// ---------------- Reviews & Ratings Endpoints ---------------- //

// Submit a review
app.post('/api/reviews', authenticateToken, (req, res) => {
  const { dishId, orderId, rating, comment, photos } = req.body;

  if (!dishId || !rating) {
    return res.status(400).json({ error: 'dishId and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const review = {
    id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    dishId,
    orderId: orderId || null,
    userId: req.user.id,
    userName: req.user.name,
    rating: parseInt(rating),
    comment: comment || '',
    photos: photos || [],
    date: new Date().toISOString(),
    helpful: 0,
    verified: orderId ? true : false,
  };

  reviews.push(review);
  res.status(201).json(review);
});

// Get reviews for a specific dish
app.get('/api/reviews/dish/:dishId', (req, res) => {
  const { dishId } = req.params;
  const dishReviews = reviews.filter(r => r.dishId === dishId);
  
  // Sort by date (newest first)
  dishReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(dishReviews);
});

// Get average rating for a dish
app.get('/api/reviews/dish/:dishId/rating', (req, res) => {
  const { dishId } = req.params;
  const dishReviews = reviews.filter(r => r.dishId === dishId);
  
  if (dishReviews.length === 0) {
    return res.json({ average: 0, count: 0 });
  }
  
  const sum = dishReviews.reduce((acc, review) => acc + review.rating, 0);
  const average = (sum / dishReviews.length).toFixed(1);
  
  res.json({ average: parseFloat(average), count: dishReviews.length });
});

// Get all reviews by current user
app.get('/api/reviews/user', authenticateToken, (req, res) => {
  const userReviews = reviews.filter(r => r.userId === req.user.id);
  userReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(userReviews);
});

// Mark review as helpful
app.post('/api/reviews/:reviewId/helpful', authenticateToken, (req, res) => {
  const { reviewId } = req.params;
  const review = reviews.find(r => r.id === reviewId);
  
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  review.helpful += 1;
  res.json(review);
});

// Delete review (only by review author)
app.delete('/api/reviews/:reviewId', authenticateToken, (req, res) => {
  const { reviewId } = req.params;
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  const review = reviews[reviewIndex];
  if (review.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this review' });
  }
  
  reviews.splice(reviewIndex, 1);
  res.json({ message: 'Review deleted successfully' });
});

// Get top-rated dishes
app.get('/api/dishes/top-rated', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  // Calculate average ratings for all dishes
  const dishRatings = dishes.map(dish => {
    const dishReviews = reviews.filter(r => r.dishId === dish.id);
    if (dishReviews.length === 0) {
      return { ...dish, avgRating: 0, reviewCount: 0 };
    }
    const sum = dishReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      ...dish,
      avgRating: sum / dishReviews.length,
      reviewCount: dishReviews.length
    };
  });
  
  // Sort by rating (high to low) and filter out dishes with no reviews
  const topRated = dishRatings
    .filter(d => d.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, limit);
  
  res.json(topRated);
});

// ---------------- Fallbacks & Error Handling ---------------- //

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Generic error handler so unexpected errors return JSON
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Tastivo backend listening on port ${PORT}`);
});
