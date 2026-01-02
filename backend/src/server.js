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

// NOTE: This is a simple demo endpoint; in real apps protect this with admin auth
app.get('/api/admin/contact-messages', (req, res) => {
  res.json(contactMessages);
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
