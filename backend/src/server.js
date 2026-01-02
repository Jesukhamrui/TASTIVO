const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Placeholder API route to extend later
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Tastivo API' });
});

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
