const PRODUCTS = [
  { id: 1, name: "Wireless Headphones", category: "Audio", desc: "Premium sound with active noise cancellation. 30-hour battery.", price: 79.99, rating: 4.8, reviews: 342, emoji: "🎧", discount: 15 },
  { id: 2, name: "Mechanical Keyboard", category: "Input", desc: "Tactile keys, RGB backlight, USB-C. Hot-swappable switches.", price: 129.00, rating: 4.9, reviews: 521, emoji: "⌨️", discount: 0 },
  { id: 3, name: "Portable Charger", category: "Power", desc: "20,000 mAh, fast-charge, dual USB. Lightweight design.", price: 39.99, rating: 4.6, reviews: 218, emoji: "🔋", discount: 20 },
  { id: 4, name: "Smart Watch", category: "Wearable", desc: "Heart rate, GPS, 7-day battery. Water-resistant.", price: 199.00, rating: 4.7, reviews: 459, emoji: "⌚", discount: 0 },
  { id: 5, name: "Desk Lamp", category: "Lighting", desc: "Adjustable brightness, warm/cool tones. Touch control.", price: 34.99, rating: 4.4, reviews: 156, emoji: "💡", discount: 25 },
  { id: 6, name: "Webcam 4K", category: "Video", desc: "Auto-focus, built-in mic, plug-and-play. Wide angle.", price: 89.00, rating: 4.5, reviews: 287, emoji: "📷", discount: 10 },
  { id: 7, name: "Mouse Pad XL", category: "Input", desc: "Non-slip base, stitched edges, 90×40 cm. Premium cloth.", price: 24.99, rating: 4.3, reviews: 95, emoji: "🖱️", discount: 0 },
  { id: 8, name: "USB-C Hub", category: "Connectivity", desc: "7-in-1: HDMI, SD card, USB-A ×3, PD. Thunderbolt 3.", price: 49.99, rating: 4.6, reviews: 331, emoji: "🔌", discount: 0 },
  { id: 9, name: "Bluetooth Speaker", category: "Audio", desc: "360° sound, 12-hour battery. IPX7 waterproof.", price: 59.99, rating: 4.7, reviews: 412, emoji: "🔊", discount: 15 },
  { id: 10, name: "Phone Stand", category: "Accessories", desc: "Adjustable angle, premium aluminum. Non-slip feet.", price: 14.99, rating: 4.2, reviews: 78, emoji: "📱", discount: 30 },
  { id: 11, name: "USB-C Cable", category: "Connectivity", desc: "High-speed data transfer. 2m length, durable.", price: 9.99, rating: 4.4, reviews: 203, emoji: "🔗", discount: 0 },
  { id: 12, name: "Wireless Mouse", category: "Input", desc: "Precision tracking, ergonomic design. 18-month battery.", price: 44.99, rating: 4.5, reviews: 389, emoji: "🖐️", discount: 18 },
];

const cart = JSON.parse(localStorage.getItem("cart") || "{}");
const wishlist = new Set(JSON.parse(localStorage.getItem("wishlist") || "[]"));

const $ = id => document.getElementById(id);
const fmt = n => "$" + n.toFixed(2);

let filteredProducts = [...PRODUCTS];

// ────────────────────────────────────────────────────────────────────────────
// Utility
// ────────────────────────────────────────────────────────────────────────────

function getDiscountedPrice(product) {
  return product.price * (1 - product.discount / 100);
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find(p => p.id === +id);
    return sum + getDiscountedPrice(p) * qty;
  }, 0);
}

function cartCount() {
  return Object.values(cart).reduce((s, q) => s + q, 0);
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "◑" : "") + "☆".repeat(empty);
}

// ────────────────────────────────────────────────────────────────────────────
// Product rendering
// ────────────────────────────────────────────────────────────────────────────

function renderProducts() {
  const grid = $("products");
  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#999;">No products found.</p>';
    return;
  }

  grid.innerHTML = filteredProducts.map(p => {
    const disc = getDiscountedPrice(p);
    const badge = p.discount > 0 ? `<div class="product-badge discount">-${p.discount}%</div>` : '';
    const wishIcon = wishlist.has(p.id) ? '♥' : '♡';
    return `
      <article class="product-card" data-id="${p.id}">
        ${badge}
        <div class="product-img">${p.emoji}</div>
        <div class="product-body">
          <div class="product-category">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">
            <span class="stars">${renderStars(p.rating)}</span>
            <span class="rating-count">${p.reviews} reviews</span>
          </div>
          <div class="product-desc">${p.desc}</div>
        </div>
        <div class="product-footer">
          <div class="product-price">
            <span class="product-price-current">${fmt(disc)}</span>
            ${p.discount > 0 ? `<span class="product-price-orig">${fmt(p.price)}</span>` : ''}
          </div>
          <div class="product-actions">
            <button class="add-btn" data-id="${p.id}" data-action="add">Add</button>
            <button class="wishlist-btn" data-id="${p.id}" data-action="wish" style="color:${wishlist.has(p.id) ? 'var(--accent)' : 'inherit'};">${wishIcon}</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function initGridEvents() {
  const grid = $("products");
  grid.addEventListener("click", e => {
    const card = e.target.closest(".product-card");
    const addBtn = e.target.closest(".add-btn");
    const wishBtn = e.target.closest(".wishlist-btn");

    if (wishBtn) {
      e.stopPropagation();
      const id = +wishBtn.dataset.id;
      toggleWishlist(id);
      renderProducts();
    } else if (addBtn) {
      e.stopPropagation();
      const id = +addBtn.dataset.id;
      cart[id] = (cart[id] || 0) + 1;
      updateCartUI();
      addBtn.textContent = "Added!";
      addBtn.classList.add("added");
      setTimeout(() => {
        addBtn.textContent = "Add";
        addBtn.classList.remove("added");
      }, 900);
    } else if (card) {
      openProductModal(+card.dataset.id);
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Filtering & Search
// ────────────────────────────────────────────────────────────────────────────

function applyFilters() {
  const search = $("searchInput").value.toLowerCase();
  const category = $("categoryFilter").value;
  const price = $("priceFilter").value;
  const sort = $("sortSelect").value;

  filteredProducts = PRODUCTS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search) && !p.desc.toLowerCase().includes(search)) return false;
    if (category && p.category !== category) return false;
    if (price) {
      const [min, max] = price.split("-").map(Number);
      const pr = getDiscountedPrice(p);
      if (pr < min || pr > max) return false;
    }
    return true;
  });

  // Sort
  if (sort === "price-asc") filteredProducts.sort((a, b) => getDiscountedPrice(a) - getDiscountedPrice(b));
  else if (sort === "price-desc") filteredProducts.sort((a, b) => getDiscountedPrice(b) - getDiscountedPrice(a));
  else if (sort === "rating") filteredProducts.sort((a, b) => b.rating - a.rating);
  // default: popular (original order)

  renderProducts();
}

const CATEGORY_ICONS = {
  "Audio": "🎵",
  "Input": "⌨️",
  "Power": "⚡",
  "Wearable": "⌚",
  "Lighting": "💡",
  "Video": "📹",
  "Connectivity": "🔌",
  "Accessories": "📱",
};

function setCategory(value) {
  $("categoryFilter").value = value;
  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.value === value);
  });
  applyFilters();
}

function initCategoryPills() {
  const categories = [...new Set(PRODUCTS.map(p => p.category))].sort();
  const container = $("categoryPills");

  const allPill = document.createElement("button");
  allPill.className = "category-pill active";
  allPill.dataset.value = "";
  allPill.innerHTML = `<span class="pill-icon">🛍️</span><span>All</span>`;
  allPill.addEventListener("click", () => setCategory(""));
  container.appendChild(allPill);

  categories.forEach(cat => {
    const pill = document.createElement("button");
    pill.className = "category-pill";
    pill.dataset.value = cat;
    pill.innerHTML = `<span class="pill-icon">${CATEGORY_ICONS[cat] || "📦"}</span><span>${cat}</span>`;
    pill.addEventListener("click", () => setCategory(cat));
    container.appendChild(pill);
  });
}

// Populate category filter
function initFilters() {
  const categories = [...new Set(PRODUCTS.map(p => p.category))].sort();
  const catSelect = $("categoryFilter");
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  $("searchInput").addEventListener("input", applyFilters);
  $("categoryFilter").addEventListener("change", e => {
    setCategory(e.target.value);
  });
  $("priceFilter").addEventListener("change", applyFilters);
  $("sortSelect").addEventListener("change", applyFilters);
}

// ────────────────────────────────────────────────────────────────────────────
// Product Modal
// ────────────────────────────────────────────────────────────────────────────

function openProductModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const disc = getDiscountedPrice(p);
  const specs = {
    "Rating": `${p.rating} ⭐ (${p.reviews} reviews)`,
    "Category": p.category,
    "In Stock": "Yes",
    "Shipping": "Free on orders over $50",
  };

  const content = `
    <div class="modal-img">${p.emoji}</div>
    <div class="modal-info">
      <div class="modal-category">${p.category}</div>
      <h2 class="modal-title">${p.name}</h2>
      <div class="modal-rating">
        <span class="stars">${renderStars(p.rating)}</span>
        <span class="rating-count">${p.reviews} customer reviews</span>
      </div>
      <div class="modal-price">
        ${fmt(disc)}${p.discount > 0 ? ` <span style="text-decoration:line-through;font-size:.7em;color:#999;">${fmt(p.price)}</span>` : ''}
      </div>
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-specs">
        ${Object.entries(specs).map(([k, v]) => `
          <div class="modal-specs-item">
            <strong>${k}</strong>
            ${v}
          </div>
        `).join('')}
      </div>
    </div>
    <div class="modal-actions">
      <button class="modal-add-btn" data-id="${id}">Add to Cart</button>
      <button class="modal-wishlist-btn" data-id="${id}" style="color:${wishlist.has(id) ? 'var(--accent)' : 'inherit'};">${wishlist.has(id) ? '♥' : '♡'}</button>
    </div>
  `;

  $("modalContent").innerHTML = content;
  $("productModal").classList.add("open");
  $("modalOverlay").classList.add("open");

  $("modalContent").addEventListener("click", e => {
    const btn = e.target.closest(".modal-add-btn");
    const wish = e.target.closest(".modal-wishlist-btn");
    if (btn) {
      const pid = +btn.dataset.id;
      cart[pid] = (cart[pid] || 0) + 1;
      updateCartUI();
      btn.textContent = "Added to cart!";
      btn.style.opacity = "0.7";
      setTimeout(() => {
        closeModal();
      }, 500);
    } else if (wish) {
      const pid = +wish.dataset.id;
      toggleWishlist(pid);
      wish.textContent = wishlist.has(pid) ? '♥' : '♡';
      wish.style.color = wishlist.has(pid) ? 'var(--accent)' : 'inherit';
      if (wishlist.has(pid)) wish.classList.add("wishlisted");
      else wish.classList.remove("wishlisted");
    }
  }, true);
}

function closeModal() {
  $("productModal").classList.remove("open");
  $("modalOverlay").classList.remove("open");
}

$("modalClose").addEventListener("click", closeModal);
$("modalOverlay").addEventListener("click", closeModal);

// ────────────────────────────────────────────────────────────────────────────
// Wishlist
// ────────────────────────────────────────────────────────────────────────────

function toggleWishlist(id) {
  if (wishlist.has(id)) wishlist.delete(id);
  else wishlist.add(id);
  localStorage.setItem("wishlist", JSON.stringify([...wishlist]));
  updateWishlistUI();
}

function renderWishlist() {
  const list = $("wishlistItems");
  const empty = $("wishlistEmpty");

  if (wishlist.size === 0) {
    list.style.display = "none";
    empty.style.display = "block";
    return;
  }

  list.style.display = "flex";
  empty.style.display = "none";

  const items = [...wishlist].map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return '';
    const disc = getDiscountedPrice(p);
    return `
      <li class="wishlist-item" data-id="${id}">
        <span class="wishlist-item-emoji">${p.emoji}</span>
        <div class="wishlist-item-info">
          <div class="wishlist-item-name">${p.name}</div>
          <div class="wishlist-item-price">${fmt(disc)}</div>
        </div>
        <div class="wishlist-item-actions">
          <button class="wishlist-add-btn" data-id="${id}" data-action="add-to-cart">Add</button>
          <button class="wishlist-remove-btn" data-id="${id}" data-action="remove">✕</button>
        </div>
      </li>
    `;
  }).join("");

  list.innerHTML = items;
}

function updateWishlistUI() {
  const count = wishlist.size;
  $("wishlistCount").textContent = count;
  $("wishlistCount").style.display = count === 0 ? "none" : "flex";
  renderWishlist();
}

function openWishlist() {
  $("wishlistDrawer").classList.add("open");
  $("wishlistOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeWishlist() {
  $("wishlistDrawer").classList.remove("open");
  $("wishlistOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

$("wishlistBtn").addEventListener("click", openWishlist);
$("closeWishlist").addEventListener("click", closeWishlist);
$("wishlistOverlay").addEventListener("click", closeWishlist);

$("wishlistItems").addEventListener("click", e => {
  const addBtn = e.target.closest(".wishlist-add-btn");
  const removeBtn = e.target.closest(".wishlist-remove-btn");

  if (addBtn) {
    const id = +addBtn.dataset.id;
    cart[id] = (cart[id] || 0) + 1;
    updateCartUI();
    addBtn.textContent = "Added!";
    addBtn.style.opacity = "0.6";
    setTimeout(() => {
      addBtn.textContent = "Add";
      addBtn.style.opacity = "1";
    }, 800);
  } else if (removeBtn) {
    const id = +removeBtn.dataset.id;
    toggleWishlist(id);
    renderProducts();
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Cart
// ────────────────────────────────────────────────────────────────────────────

function renderCart() {
  const list = $("cartItems");
  const footer = $("cartFooter");
  const empty = $("cartEmpty");

  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  const hasItems = entries.length > 0;

  footer.style.display = hasItems ? "block" : "none";
  empty.style.display = hasItems ? "none" : "block";

  list.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(p => p.id === +id);
    const disc = getDiscountedPrice(p);
    return `
      <li class="cart-item">
        <span class="cart-item-emoji">${p.emoji}</span>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${fmt(disc)} each</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${id}" data-action="dec">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" data-id="${id}" data-action="inc">+</button>
        </div>
      </li>
    `;
  }).join("");

  const total = cartTotal();
  $("cartSubtotal").textContent = fmt(total);
  $("cartTotal").textContent = fmt(total);
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
  saveCart();
  const count = cartCount();
  $("cartCount").textContent = count;
  $("cartCount").style.display = count === 0 ? "none" : "flex";
  renderCart();
}

function openCart() {
  $("cartDrawer").classList.add("open");
  $("overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("overlay").classList.remove("open");
  document.body.style.overflow = "";
}

$("cartBtn").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);

$("cartItems").addEventListener("click", e => {
  const btn = e.target.closest(".qty-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "inc") {
    cart[id] = (cart[id] || 0) + 1;
  } else {
    cart[id] = Math.max(0, (cart[id] || 0) - 1);
    if (cart[id] === 0) delete cart[id];
  }
  updateCartUI();
});

document.querySelector(".checkout-btn")?.addEventListener("click", () => {
  alert("Order placed! Thanks for shopping at SimpleShop. Order total: " + fmt(cartTotal()));
  Object.keys(cart).forEach(k => delete cart[k]);
  updateCartUI();
  closeCart();
});

// ────────────────────────────────────────────────────────────────────────────
// Init
// ────────────────────────────────────────────────────────────────────────────

initFilters();
initCategoryPills();
initGridEvents();
renderProducts();
updateWishlistUI();
updateCartUI();
