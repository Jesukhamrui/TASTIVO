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
  // Mexican Food
  {
    id: '1001',
    name: 'Tacos',
    description: 'Classic Mexican tacos with beef, lettuce, cheese, and salsa.',
    rate: 120,
    category: 'Mexican',
    imageUrl: '/images/mexican/tacos.jpg',
    ingredients: ['beef', 'lettuce', 'cheese', 'salsa', 'tortilla'],
    dietary: [],
    spicy: true,
  },
  {
    id: '1002',
    name: 'Burrito',
    description: 'Flour tortilla filled with beans, rice, chicken, and veggies.',
    rate: 150,
    category: 'Mexican',
    imageUrl: '/images/mexican/burrito.jpg',
    ingredients: ['tortilla', 'beans', 'rice', 'chicken', 'vegetables'],
    dietary: [],
    spicy: true,
  },
  // Chinese Food
  {
    id: '2001',
    name: 'Chow Mein',
    description: 'Stir-fried noodles with vegetables and chicken.',
    rate: 110,
    category: 'Chinese',
    imageUrl: '/images/chinese/chow-mein.jpg',
    ingredients: ['noodles', 'chicken', 'vegetables', 'soy sauce'],
    dietary: [],
    spicy: false,
  },
  {
    id: '2002',
    name: 'Spring Rolls',
    description: 'Crispy rolls stuffed with veggies and served with sweet chili sauce.',
    rate: 130,
    category: 'Chinese',
    imageUrl: '/images/chinese/spring-rolls.jpg',
    ingredients: ['vegetables', 'wrapper', 'chili sauce'],
    dietary: ['vegetarian'],
    spicy: false,
  },
  // American Food
  {
    id: '3001',
    name: 'Burger',
    description: 'Juicy beef burger with cheese, lettuce, and tomato.',
    rate: 140,
    category: 'American',
    imageUrl: '/images/american/burger.jpg',
    ingredients: ['beef', 'cheese', 'lettuce', 'tomato', 'bun'],
    dietary: [],
    spicy: false,
  },
  {
    id: '3002',
    name: 'Fries',
    description: 'Crispy golden fries served with ketchup.',
    rate: 90,
    category: 'American',
    imageUrl: '/images/american/fries.jpg',
    ingredients: ['potato', 'oil', 'salt'],
    dietary: ['vegetarian', 'vegan'],
    spicy: false,
  },
  // Thai Food
  {
    id: '4001',
    name: 'Pad Thai',
    description: 'Rice noodles stir-fried with shrimp, tofu, peanuts, and bean sprouts.',
    rate: 160,
    category: 'Thai',
    imageUrl: '/images/thai/pad-thai.jpg',
    ingredients: ['noodles', 'shrimp', 'tofu', 'peanuts', 'bean sprouts'],
    dietary: [],
    spicy: true,
  },
  {
    id: '4002',
    name: 'Green Curry',
    description: 'Spicy Thai green curry with chicken and vegetables.',
    rate: 120,
    category: 'Thai',
    imageUrl: '/images/thai/green-curry.jpg',
    ingredients: ['chicken', 'curry paste', 'coconut milk', 'vegetables'],
    dietary: [],
    spicy: true,
  },
  // Indian Food
  {
    id: '1',
    name: 'Idly',
    description: 'Soft steamed rice cakes served with sambar and chutney.',
    rate: 50,
    category: 'Indian',
    imageUrl: '/images/indian/idly.jpg',
    ingredients: ['rice', 'urad dal', 'sambar', 'chutney'],
    dietary: ['vegetarian', 'vegan', 'gluten-free'],
    spicy: false,
  },
  {
    id: '2',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces.',
    rate: 250,
    category: 'Indian',
    imageUrl: '/images/indian/butter-chicken.jpg',
    ingredients: ['chicken', 'cream', 'tomato', 'spices', 'butter'],
    dietary: [],
    spicy: true,
  },
  {
    id: '3',
    name: 'Paneer Tikka',
    description: 'Indian cheese skewers marinated in yogurt and spices.',
    rate: 180,
    category: 'Indian',
    imageUrl: '/images/indian/paneer-tikka.jpg',
    ingredients: ['paneer', 'yogurt', 'spices', 'peppers'],
    dietary: ['vegetarian'],
    spicy: true,
  },
  {
    id: '4',
    name: 'Biryani',
    description: 'Fragrant rice dish with spiced meat and aromatic herbs.',
    rate: 220,
    category: 'Indian',
    imageUrl: '/images/indian/biryani.jpg',
    ingredients: ['rice', 'chicken', 'spices', 'herbs', 'saffron'],
    dietary: [],
    spicy: true,
  },
  // Italian Food
  {
    id: '5001',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella and basil.',
    rate: 200,
    category: 'Italian',
    imageUrl: '/images/italian/margherita.jpg',
    ingredients: ['cheese', 'basil', 'tomato', 'dough'],
    dietary: ['vegetarian'],
    spicy: false,
  },
  {
    id: '5002',
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon, egg, and parmesan cheese.',
    rate: 180,
    category: 'Italian',
    imageUrl: '/images/italian/carbonara.jpg',
    ingredients: ['pasta', 'bacon', 'egg', 'parmesan', 'cream'],
    dietary: [],
    spicy: false,
  },
  // Korean Food
  {
    id: '6001',
    name: 'Bibimbap',
    description: 'Korean mixed rice bowl with veggies, beef, and egg.',
    rate: 190,
    category: 'Korean',
    imageUrl: '/images/korean/bibimbap.jpg',
    ingredients: ['beef', 'rice', 'vegetables', 'egg', 'gochujang'],
    dietary: [],
    spicy: true,
  },
  {
    id: '6002',
    name: 'Kimchi',
    description: 'Fermented Korean side dish made with cabbage and spices.',
    rate: 80,
    category: 'Korean',
    imageUrl: '/images/korean/kimchi.jpg',
    ingredients: ['cabbage', 'chili', 'garlic', 'ginger'],
    dietary: ['vegetarian', 'vegan'],
    spicy: true,
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

// Advanced search with filters
app.get('/api/search', (req, res) => {
  console.log('Search request:', req.query);
  let results = [...dishes];

  // Search by name or ingredients (query parameter)
  if (req.query.q) {
    const query = req.query.q.toLowerCase();
    console.log('Searching for:', query);
    results = results.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.ingredients.some(ing => ing.toLowerCase().includes(query))
    );
    console.log('Search results count:', results.length);
  }

  // Filter by category
  if (req.query.category) {
    const category = req.query.category.toLowerCase();
    results = results.filter(d => d.category.toLowerCase() === category);
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;
    results = results.filter(d => d.rate >= minPrice && d.rate <= maxPrice);
  }

  // Filter by dietary preferences (can be multiple: vegetarian, vegan, gluten-free)
  if (req.query.dietary) {
    const dietaryList = Array.isArray(req.query.dietary) 
      ? req.query.dietary 
      : [req.query.dietary];
    results = results.filter(d => {
      return dietaryList.some(pref => 
        d.dietary && d.dietary.includes(pref.toLowerCase())
      );
    });
  }

  // Filter by spicy preference
  if (req.query.spicy !== undefined) {
    const spicyPref = req.query.spicy === 'true' || req.query.spicy === '1';
    results = results.filter(d => d.spicy === spicyPref);
  }

  // Sort results
  if (req.query.sortBy) {
    if (req.query.sortBy === 'price-low') {
      results.sort((a, b) => a.rate - b.rate);
    } else if (req.query.sortBy === 'price-high') {
      results.sort((a, b) => b.rate - a.rate);
    } else if (req.query.sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  res.json({
    count: results.length,
    results: results,
  });
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
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
        note: 'Order placed successfully'
      }
    ],
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString(), // 45 minutes from now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

// Track order status (public endpoint - only need order ID)
app.get('/api/orders/:id/track', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  // Return tracking information without sensitive user data
  res.json({
    id: order.id,
    status: order.status,
    statusHistory: order.statusHistory,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    totalAmount: order.totalAmount,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))
  });
});

// Admin: Update order status
app.patch('/api/admin/orders/:id/status', authenticateToken, (req, res) => {
  // Check if user is admin (simple check based on email)
  if (!req.user.email || !req.user.email.toLowerCase().includes('admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { status, note } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status', 
      validStatuses 
    });
  }

  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Update order status
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  // Add to status history
  order.statusHistory.push({
    status: status,
    timestamp: new Date().toISOString(),
    note: note || `Order status updated to ${status}`,
    updatedBy: req.user.email
  });

  // Update estimated delivery time based on status
  if (status === 'confirmed') {
    order.estimatedDeliveryTime = new Date(Date.now() + 40 * 60000).toISOString(); // 40 min
  } else if (status === 'preparing') {
    order.estimatedDeliveryTime = new Date(Date.now() + 30 * 60000).toISOString(); // 30 min
  } else if (status === 'out-for-delivery') {
    order.estimatedDeliveryTime = new Date(Date.now() + 15 * 60000).toISOString(); // 15 min
  } else if (status === 'delivered') {
    order.estimatedDeliveryTime = new Date().toISOString(); // Now
  }

  console.log(`Order ${order.id} status updated to ${status} by ${req.user.email}`);
  res.json(order);
});

// Admin: Get all orders with filters
app.get('/api/admin/orders', authenticateToken, (req, res) => {
  // Check if user is admin
  if (!req.user.email || !req.user.email.toLowerCase().includes('admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  let filteredOrders = [...orders];

  // Filter by status
  if (req.query.status) {
    filteredOrders = filteredOrders.filter(o => o.status === req.query.status);
  }

  // Sort by creation date (newest first)
  filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    count: filteredOrders.length,
    orders: filteredOrders
  });
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
