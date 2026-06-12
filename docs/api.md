# API Reference

## Auth (public)

| Method | Path | Body / Params | Description |
|--------|------|---------------|-------------|
| POST | `/api/auth/register` | `{ username, email, password }` | Create account — returns user object |
| POST | `/api/auth/login` | `{ username, password }` | Log in — returns user object |
| POST | `/api/auth/logout` | — | Destroy session |
| GET | `/api/auth/me` | — | Return current user, or 401 |

## Products (public)

| Method | Path | Params | Description |
|--------|------|--------|-------------|
| GET | `/api/products` | `?search=`, `?category=`, `?price=0-50`, `?sort=price-asc\|price-desc\|rating` | List products |
| GET | `/api/products/:id` | — | Single product |

## Cart (requires login)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/cart` | — | Get cart `{ items, count, total }` |
| POST | `/api/cart` | `{ productId }` | Add item |
| PUT | `/api/cart/:productId` | `{ quantity }` | Update quantity |
| DELETE | `/api/cart/:productId` | — | Remove item |
| DELETE | `/api/cart` | — | Clear cart |

## Wishlist (requires login)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/wishlist` | Get wishlist items (full product objects) |
| POST | `/api/wishlist/:productId` | Toggle — returns `{ inWishlist, wishlistIds }` |

## Checkout (requires login)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/checkout` | Place order, clear cart — returns `{ success, orderId, total }` |
