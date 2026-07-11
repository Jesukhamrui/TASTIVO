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

## Gmail OTP Email Setup

Use a Gmail app password, not your normal Gmail login password.

Add your real Gmail sender account details in `backend/.env`:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=your-real-gmail-address@gmail.com`
- `SMTP_PASS=your-16-character-google-app-password`
- `MAIL_FROM=your-real-gmail-address@gmail.com`

Place those values in the `backend/.env` file, not in the frontend `.env` file and not in source code.

The same Gmail account is used only as the sender. OTP emails are still delivered to each registered user's email address based on the login request.

If you prefer port 587, set `SMTP_PORT=587` and `SMTP_SECURE=false`.

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
