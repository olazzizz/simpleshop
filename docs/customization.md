# Customization

## Add or edit products

Modify `backend/data/products.js` and restart the server — products are upserted on every startup:

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

## Change the colour scheme

Edit CSS variables in `styles.css`:

```css
:root {
  --brand:  #1a1a2e;   /* dark header */
  --accent: #e94560;   /* CTAs, wishlist active */
  --bg:     #f5f5f7;
  --text:   #111;
}
```

## Architecture notes

- **Vanilla JS frontend** — no framework, no bundler; `app.js` talks to the backend exclusively via `fetch`
- **Server-side filtering** — search, category, price, and sort are all handled by the API
- **Session-based auth** — bcrypt password hashing; cart and wishlist keyed by `user_id` in PostgreSQL
- **Event delegation** — efficient DOM event handling on product grid, cart, and wishlist drawers
- **Responsive layout** — `clamp()` and CSS Grid; adapts from mobile to desktop
