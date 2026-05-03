# SimpleShop – A Modern Storefront App

A lightweight e-commerce storefront with a vanilla JS frontend and a Node.js/Express backend. Supports product browsing, filtering, cart management, and wishlist — all backed by a REST API with session-based state.

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
- **Session-persistent cart** — state lives on the server

### ❤️ Wishlist
- **Toggle wishlist** with heart icon on any product or modal
- **Dedicated wishlist drawer** to view and manage saved items
- **Wishlist count** badge in the header

### 📱 Product Details Modal
- **Click any product** to view full details in a modal
- **Large emoji thumbnail**, full description, and specs table
- **Quick add to cart** and wishlist toggle from the detail view

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

## File Structure

```
.
├── index.html              # App shell — modals, drawers, layout
├── styles.css              # All styling and responsive design
├── app.js                  # Frontend logic — API calls, rendering, events
├── backend/
│   ├── server.js           # Express app setup, session config, static serving
│   ├── package.json
│   ├── data/
│   │   └── products.js     # Product catalogue (source of truth)
│   └── routes/
│       ├── products.js     # GET /api/products, GET /api/products/:id
│       ├── cart.js         # GET/POST /api/cart, PUT/DELETE /api/cart/:id
│       ├── wishlist.js     # GET /api/wishlist, POST /api/wishlist/:id
│       └── checkout.js     # POST /api/checkout
└── README.md
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products. Accepts `?search=`, `?category=`, `?price=0-50`, `?sort=price-asc\|price-desc\|rating` |
| GET | `/api/products/:id` | Single product |
| GET | `/api/cart` | Get cart (`{ items, count, total }`) |
| POST | `/api/cart` | Add item (`{ productId }`) |
| PUT | `/api/cart/:productId` | Update quantity (`{ quantity }`) |
| DELETE | `/api/cart/:productId` | Remove item |
| DELETE | `/api/cart` | Clear cart |
| GET | `/api/wishlist` | Get wishlist items (full product objects) |
| POST | `/api/wishlist/:productId` | Toggle wishlist — returns `{ inWishlist, wishlistIds }` |
| POST | `/api/checkout` | Clears cart, returns `{ success, total }` |

## Customization

### Edit Products
Modify `backend/data/products.js`:

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
- **Express backend** with `express-session` for per-user cart and wishlist
- **Server-side filtering** — search, category, price, and sort all handled by the API
- **Event delegation** — efficient DOM event handling on product grid, cart, and wishlist
- **Responsive design** — `clamp()` and CSS Grid for fluid layout

## License

Free to use, modify, and distribute.

---

**Questions?** Open an issue or submit a pull request!
