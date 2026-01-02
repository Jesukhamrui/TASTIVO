# Tastivo Backend

Basic Express API scaffold for Tastivo.

## Setup

1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   or for production
   ```bash
   npm start
   ```

## Main Endpoints (summary)

### Health

- `GET /health` – uptime/status check.

### Auth & Users

- `POST /api/auth/register` – register a new user (name, email, password).
- `POST /api/auth/login` – login and receive a JWT token.
- `GET /api/auth/me` – get current authenticated user.
- `GET /api/users/me` – get profile for current user.
- `PUT /api/users/me` – update profile (name for now).

### Dishes & Categories

- `GET /api/dishes` – list all dishes.
- `GET /api/dishes/:id` – dish details.
- `GET /api/categories` – list all categories.
- `GET /api/categories/:category/dishes` – dishes for a given category.

### Cart & Orders

- `POST /api/cart/validate` – send `{ items: [{ dishId, quantity }] }`, get validated prices + total.
- `POST /api/orders` – create an order from cart items (auth required).
- `GET /api/orders` – list current user orders.
- `GET /api/orders/:id` – single order by id (only if belongs to user).

### Contact

- `POST /api/contact` – send contact/support message.
- `GET /api/admin/contact-messages` – list all contact messages (demo; not secured).

### Favorites

- `POST /api/favorites/:dishId` – add a dish to favorites (auth required).
- `DELETE /api/favorites/:dishId` – remove dish from favorites.
- `GET /api/favorites` – get all favorite dishes for current user.
