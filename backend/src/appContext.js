const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const USERS_DATA_FILE = path.resolve(__dirname, '../data/users.json');

const state = {
  orders: [],
  contactMessages: [],
  reviews: [],
  paymentSessions: [],
  emailLoginCodes: [],
  passwordResetCodes: [],
  passwordResetTokens: [],
  users: [],
};

const dishes = [
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

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(USERS_DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load users data:', error);
    return [];
  }
}

function saveUsers() {
  try {
    fs.mkdirSync(path.dirname(USERS_DATA_FILE), { recursive: true });
    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify(state.users, null, 2));
  } catch (error) {
    console.error('Failed to save users data:', error);
  }
}

function generateToken(user, jwtSecret) {
  return jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
}

function authenticateTokenFactory(jwtSecret) {
  return function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    jwt.verify(token, jwtSecret, (err, payload) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      const user = state.users.find(u => u.id === payload.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found for token' });
      }
      req.user = user;
      next();
    });
  };
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateEmailLoginCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function clearExpiredEmailLoginCodes() {
  const now = Date.now();
  state.emailLoginCodes = state.emailLoginCodes.filter(entry => entry.expiresAt > now);
}

function clearExpiredPasswordResetCodes() {
  const now = Date.now();
  state.passwordResetCodes = state.passwordResetCodes.filter(entry => entry.expiresAt > now);
}

function clearExpiredPasswordResetTokens() {
  const now = Date.now();
  state.passwordResetTokens = state.passwordResetTokens.filter(entry => entry.expiresAt > now);
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function calculateCartTotals(items) {
  let total = 0;
  const detailedItems = items.map(item => {
    const dishId = item.dishId ?? item.id ?? item.productId;
    const quantity = Number(item.quantity ?? item.cartQuantity) || 1;
    const dish = dishes.find(d => d.id === String(dishId));
    if (!dish) {
      return null;
    }
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

state.users = loadUsers();

module.exports = {
  state,
  dishes,
  USERS_DATA_FILE,
  loadUsers,
  saveUsers,
  generateToken,
  authenticateTokenFactory,
  publicUser,
  isValidEmail,
  generateEmailLoginCode,
  clearExpiredEmailLoginCodes,
  clearExpiredPasswordResetCodes,
  clearExpiredPasswordResetTokens,
  generateResetToken,
  calculateCartTotals,
};
