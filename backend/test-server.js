const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(5000, '0.0.0.0', () => {
  console.log('Test server listening on port 5000');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
