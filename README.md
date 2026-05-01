# SimpleShop – A Modern Storefront App

A lightweight, vanilla JavaScript e-commerce storefront with product browsing, filtering, cart management, and wishlist functionality. No build tools or dependencies required — just open and use.

## Features

### 🛍️ Product Catalog
- **12 curated products** across 6 categories (Audio, Input, Power, Wearable, Lighting, Video, Connectivity, Accessories)
- **Product cards** with emoji thumbnails, names, descriptions, ratings, and review counts
- **Discount badges** showing percentage off for items on sale
- **Star ratings** (1–5 stars) with half-star support

### 🔍 Search & Filtering
- **Live search** across product names and descriptions
- **Category filter** to browse by product type
- **Price ranges** (Under $50, $50–$150, $150+)
- **Sorting options**: Most Popular, Price (Low–High / High–Low), Top Rated

### 🛒 Shopping Cart
- **Add to cart** with visual feedback ("Added!" confirmation)
- **Quantity controls** (+ / − buttons) in the cart drawer
- **Dynamic total** calculation with discounted prices
- **Persistent cart state** during the session
- **Free shipping notice** on orders over $50

### ❤️ Wishlist
- **Add/remove items** to wishlist with heart icon toggle
- **Persistent storage** via browser localStorage
- **Dedicated wishlist drawer** to view saved items
- **Wishlist count** in the header

### 📱 Product Details Modal
- **Click any product** to view full details in a modal
- **Large emoji thumbnail**, full description, and specs
- **Quick add to cart** from the detail view

### 🎨 Design
- **Responsive grid layout** that adapts from mobile to desktop
- **Smooth animations** and hover effects
- **Accessible UI** with ARIA labels and semantic HTML
- **Dark header** with accent colors for CTAs

## Getting Started

### Installation
No installation required! Simply open `index.html` in any modern web browser:

```bash
# Option 1: Double-click the file
open index.html

# Option 2: Use a local server (recommended)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

> **Note:** Some browsers restrict localStorage in `file://` protocol. Use a local server for full functionality.

## File Structure

```
.
├── index.html          # HTML structure with modals and drawers
├── styles.css          # All styling and responsive design
├── app.js              # Product logic, cart, wishlist, filtering
└── README.md           # This file
```

## How to Use

### Browse Products
1. View the full catalog on the homepage
2. Use the search bar to find specific items
3. Filter by category, price range, or sort by rating/price
4. Click any product card to see full details in a modal

### Shopping
1. Click **"Add"** on a product card (or from the detail modal)
2. See your cart count update in the header
3. Click the **cart icon** to open the cart drawer
4. Adjust quantities with + / − buttons
5. Review the total (accounts for discounts and free shipping info)
6. Click **"Checkout"** to place your order (demo)

### Wishlist
1. Click the **heart icon** (♡) on any product to save it
2. Click the **heart icon in the header** to view your wishlist
3. Wishlist is saved automatically to your browser

## Product Data

Each product includes:
- **ID** – Unique identifier
- **Name** – Product title
- **Category** – Type of product
- **Description** – Short feature summary
- **Price** – Original price
- **Discount** – Percentage off (0–30%)
- **Rating** – Customer rating (4.2–4.9 stars)
- **Reviews** – Number of customer reviews
- **Emoji** – Visual thumbnail

### Sample Products
- 🎧 Wireless Headphones – $79.99 (15% off)
- ⌨️ Mechanical Keyboard – $129.00
- 🔋 Portable Charger – $39.99 (20% off)
- ⌚ Smart Watch – $199.00
- 💡 Desk Lamp – $34.99 (25% off)
- 📷 Webcam 4K – $89.00 (10% off)
- 🖱️ Mouse Pad XL – $24.99
- 🔌 USB-C Hub – $49.99
- 🔊 Bluetooth Speaker – $59.99 (15% off)
- 📱 Phone Stand – $14.99 (30% off)
- 🔗 USB-C Cable – $9.99
- 🖐️ Wireless Mouse – $44.99 (18% off)

## Customization

### Edit Products
Open `app.js` and modify the `PRODUCTS` array:

```javascript
{ 
  id: 1, 
  name: "Product Name", 
  category: "Category",
  desc: "Short description",
  price: 99.99,
  rating: 4.8,
  reviews: 342,
  emoji: "🎧",
  discount: 15
}
```

### Change Colors
Edit CSS variables in `styles.css`:

```css
:root {
  --brand: #1a1a2e;      /* Primary color */
  --accent: #e94560;     /* Highlight color */
  --bg: #f5f5f7;         /* Background */
  --text: #111;          /* Text color */
}
```

### Modify Filters
Update filter ranges in `index.html`:

```html
<option value="0-100">Under $100</option>
```

And adjust the corresponding logic in `app.js`.

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge):
- ES6+ JavaScript
- CSS Grid & Flexbox
- localStorage API
- SVG (inline icons)

## Technical Highlights

- **Zero dependencies** – Vanilla JavaScript, no frameworks
- **No build step** – Direct HTML/CSS/JS execution
- **localStorage** – Persistent wishlist across sessions
- **Event delegation** – Efficient DOM event handling
- **Responsive design** – `clamp()` and CSS Grid for fluid layout
- **Accessible** – Semantic HTML, ARIA labels, keyboard navigation

## Demo Features

- Click "Checkout" to see an order confirmation (clears cart)
- Search for "keyboard" to filter products
- Add items to wishlist and refresh — they persist
- Open the developer console to inspect cart/wishlist state

## Future Enhancements

- User accounts and saved carts
- Product images (real or placeholder service)
- Customer reviews and ratings submission
- Coupon codes and promo discounts
- Order history
- Analytics tracking
- Payment gateway integration

## License

Free to use, modify, and distribute.

---

**Questions?** Open an issue or submit a pull request!
