# SimpleShop – A Modern Storefront App

A lightweight e-commerce storefront with a vanilla JS frontend and a Node.js/Express backend. Supports user registration and login, product browsing, filtering, cart management, and wishlist — all backed by a REST API with SQLite-persisted state.

## Features

### 🛍️ Product Catalog
- **12 curated products** across 8 categories (Audio, Input, Power, Wearable, Lighting, Video, Connectivity, Accessories)
- **Product cards** with emoji thumbnails, names, descriptions, ratings, and review counts
- **Discount badges** showing percentage off for items on sale
- **Star ratings** (1–5 stars) with half-star support

### 🔍 Search & Filtering
- **Live search** across product names and descriptions (server-side)
- **Category pills** for quick one-click category browsing
- **Price ranges** (Under $50, $50–$150, $150+)
- **Sorting options**: Most Popular, Price (Low–High / High–Low), Top Rated

### 🛒 Shopping Cart
- **Add to cart** with visual feedback ("Added!" confirmation)
- **Quantity controls** (+ / − buttons) in the cart drawer
- **Dynamic total** calculation with discounted prices
- **Persistent cart** — survives server restarts via SQLite

### ❤️ Wishlist
- **Toggle wishlist** with heart icon on any product or modal
- **Dedicated wishlist drawer** to view and manage saved items
- **Wishlist count** badge in the header
- **Persistent wishlist** — survives server restarts via SQLite

### 📱 Product Details Modal
- **Click any product** to view full details in a modal
- **Large emoji thumbnail**, full description, and specs table
- **Quick add to cart** and wishlist toggle from the detail view

### 👤 User Accounts
- **Register and log in** via a modal with Login / Create Account tabs
- **Per-user cart and wishlist** — persisted in SQLite and restored on every login
- **Passwords hashed** with bcrypt before storage
- **Session-based authentication** — stays logged in across page refreshes for 24 hours
- **Unauthenticated access** prompts the login modal automatically

### 🎨 Design
- **Responsive grid layout** that adapts from mobile to desktop
- **Smooth animations** and hover effects
- **Dark header** with accent colors for CTAs

## Getting Started

### Prerequisites
- Node.js 18+

### Installation & Running

```bash
cd backend
npm install        # first time only
npm run dev        # starts with --watch (auto-restarts on changes)
```

Visit `http://localhost:3000`. Override the port with `PORT=8080 npm start`.

The backend serves both the API and the frontend static files — no separate frontend server needed.

On first start, the SQLite database is created automatically at `backend/db/simpleshop.db` and seeded with the product catalogue.

## File Structure

```
.
├── index.html              # App shell — modals, drawers, layout
├── styles.css              # All styling and responsive design
├── app.js                  # Frontend logic — API calls, rendering, events
├── backend/
│   ├── server.js           # Express app setup, session config, static serving
│   ├── package.json
│   ├── Dockerfile          # Container image (UBI9 Node 22)
│   ├── data/
│   │   └── products.js     # Product catalogue (seed data)
│   ├── db/
│   │   └── database.js     # SQLite setup, schema, and product seeding
│   ├── middleware/
│   │   └── requireAuth.js  # 401 guard for protected routes
│   └── routes/
│       ├── auth.js         # POST /api/auth/register|login|logout, GET /api/auth/me
│       ├── products.js     # GET /api/products, GET /api/products/:id
│       ├── cart.js         # GET/POST /api/cart, PUT/DELETE /api/cart/:id
│       ├── wishlist.js     # GET /api/wishlist, POST /api/wishlist/:id
│       └── checkout.js     # POST /api/checkout
├── k8s/
│   ├── deployment.yml      # Kubernetes Deployment (1 replica)
│   ├── service.yml         # ClusterIP Service (port 80 → 3000)
│   └── secret.yml          # SESSION_SECRET
└── README.md
```

## Database

SimpleShop uses **SQLite** (via `better-sqlite3`) for data persistence. The database file is created automatically on first run and is excluded from version control.

### Schema

| Table | Purpose |
|-------|---------|
| `users` | Registered users (`username`, `email`, `password_hash`) |
| `products` | Product catalogue, seeded from `data/products.js` on startup |
| `cart_items` | Per-user cart rows (`user_id`, `product_id`, `quantity`) |
| `wishlist_items` | Per-user wishlist rows (`user_id`, `product_id`) |
| `orders` | Order header written on checkout (`user_id`, `total`, `created_at`) |
| `order_items` | Line items per order (`order_id`, `product_id`, `quantity`, `unit_price`) |

### Configuration

| Environment variable | Default | Description |
|---------------------|---------|-------------|
| `DB_PATH` | `backend/db/simpleshop.db` | Path to the SQLite database file |
| `PORT` | `3000` | HTTP port |
| `SESSION_SECRET` | `simpleshop-dev-secret` | Session signing secret (change in production) |

## Running with Podman

Build and run the container locally (run from the project root):

```bash
podman build -t simpleshop:latest -f backend/Dockerfile .
podman run --rm -p 3000:3000 simpleshop:latest
```

Visit `http://localhost:3000`.

## Kubernetes Deployment

### 1. Set the session secret

Edit `k8s/secret.yml` and replace the placeholder value:

```yaml
stringData:
  SESSION_SECRET: "your-secret-here"
```

### 2. Push the image to a registry

```bash
podman tag simpleshop:latest <your-registry>/simpleshop:latest
podman push <your-registry>/simpleshop:latest
```

### 3. Update the image reference

In `k8s/deployment.yml`, set the `image` field to match your registry:

```yaml
image: <your-registry>/simpleshop:latest
```

### 4. Create the registry pull secret

The pull secret must be created locally and never committed to version control, as it contains registry credentials.

If you are logged into the registry via Podman, reuse the existing auth file:

```bash
kubectl create secret generic quay-pull-secret \
  --from-file=.dockerconfigjson=${XDG_RUNTIME_DIR}/containers/auth.json \
  --type=kubernetes.io/dockerconfigjson
```

Otherwise, create it from credentials directly:

```bash
kubectl create secret docker-registry quay-pull-secret \
  --docker-server=<your-registry> \
  --docker-username=<your-username> \
  --docker-password=<your-password-or-token>
```

### 5. Apply the manifests

```bash
kubectl apply -f k8s/
```

This creates the Session Secret, Deployment, and ClusterIP Service.

### 6. Access the app

```bash
kubectl port-forward service/simpleshop 3000:80
```

Visit `http://localhost:3000`.

## API Reference

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account (`{ username, email, password }`) — returns user object |
| POST | `/api/auth/login` | Log in (`{ username, password }`) — returns user object |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/me` | Return current user, or 401 if not logged in |

### Products (public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products. Accepts `?search=`, `?category=`, `?price=0-50`, `?sort=price-asc\|price-desc\|rating` |
| GET | `/api/products/:id` | Single product |

### Cart, Wishlist, Checkout (require login)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cart` | Get cart (`{ items, count, total }`) |
| POST | `/api/cart` | Add item (`{ productId }`) |
| PUT | `/api/cart/:productId` | Update quantity (`{ quantity }`) |
| DELETE | `/api/cart/:productId` | Remove item |
| DELETE | `/api/cart` | Clear cart |
| GET | `/api/wishlist` | Get wishlist items (full product objects) |
| POST | `/api/wishlist/:productId` | Toggle wishlist — returns `{ inWishlist, wishlistIds }` |
| POST | `/api/checkout` | Place order, clear cart — returns `{ success, orderId, total }` |

## Customization

### Edit Products
Modify `backend/data/products.js` and restart the server — products are upserted into the database on every startup:

```javascript
{ 
  id: 13,
  name: "Product Name",
  category: "Category",
  desc: "Short description",
  price: 99.99,
  rating: 4.8,
  reviews: 342,
  emoji: "🎧",
  discount: 15    // percentage off; 0 = no discount
}
```

### Change Colors
Edit CSS variables in `styles.css`:

```css
:root {
  --brand:  #1a1a2e;   /* dark header */
  --accent: #e94560;   /* CTAs, wishlist active */
  --bg:     #f5f5f7;
  --text:   #111;
}
```

## Technical Highlights

- **Vanilla JS frontend** — no framework, no bundler
- **User authentication** — bcrypt password hashing, session-based login, 401 interception opens login modal
- **SQLite persistence** — users, cart, wishlist, and orders survive server restarts; WAL mode enabled for write performance
- **Express backend** with `express-session`; cart and wishlist keyed by `user_id`
- **Server-side filtering** — search, category, price, and sort all handled by the API
- **Event delegation** — efficient DOM event handling on product grid, cart, and wishlist
- **Responsive design** — `clamp()` and CSS Grid for fluid layout

## License

Free to use, modify, and distribute.

---

**Questions?** Open an issue or submit a pull request!
