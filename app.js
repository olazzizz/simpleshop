// ────────────────────────────────────────────────────────────────────────────
// State
// ────────────────────────────────────────────────────────────────────────────

let allProducts = [];
let products    = [];
let cart        = { items: [], count: 0, total: 0 };
let wishlistIds = new Set();

const $ = id => document.getElementById(id);
const fmt = n => "$" + n.toFixed(2);

// ────────────────────────────────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────────────────────────────────

async function apiFetch(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

const apiGet    = path        => apiFetch('GET',    path);
const apiPost   = (path, body) => apiFetch('POST',   path, body);
const apiPut    = (path, body) => apiFetch('PUT',    path, body);
const apiDelete = path        => apiFetch('DELETE', path);

// ────────────────────────────────────────────────────────────────────────────
// Utility
// ────────────────────────────────────────────────────────────────────────────

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "◑" : "") + "☆".repeat(empty);
}

// ────────────────────────────────────────────────────────────────────────────
// Product rendering
// ────────────────────────────────────────────────────────────────────────────

async function fetchProducts() {
  const params = new URLSearchParams();
  const search   = $("searchInput").value.trim();
  const category = $("categoryFilter").value;
  const price    = $("priceFilter").value;
  const sort     = $("sortSelect").value;

  if (search)   params.set('search',   search);
  if (category) params.set('category', category);
  if (price)    params.set('price',    price);
  if (sort)     params.set('sort',     sort);

  products = await apiGet(`/api/products?${params}`);
  renderProducts();
}

function renderProducts() {
  const grid = $("products");
  if (products.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#999;">No products found.</p>';
    return;
  }

  grid.innerHTML = products.map(p => {
    const disc  = discountedPrice(p);
    const badge = p.discount > 0 ? `<div class="product-badge discount">-${p.discount}%</div>` : '';
    const wished = wishlistIds.has(p.id);
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
            <button class="wishlist-btn" data-id="${p.id}" data-action="wish" style="color:${wished ? 'var(--accent)' : 'inherit'};">${wished ? '♥' : '♡'}</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function initGridEvents() {
  const grid = $("products");
  grid.addEventListener("click", async e => {
    const card    = e.target.closest(".product-card");
    const addBtn  = e.target.closest(".add-btn");
    const wishBtn = e.target.closest(".wishlist-btn");

    if (wishBtn) {
      e.stopPropagation();
      await toggleWishlist(+wishBtn.dataset.id);
      renderProducts();
    } else if (addBtn) {
      e.stopPropagation();
      addBtn.disabled = true;
      cart = await apiPost('/api/cart', { productId: +addBtn.dataset.id });
      updateCartUI();
      addBtn.textContent = "Added!";
      addBtn.classList.add("added");
      setTimeout(() => {
        addBtn.textContent = "Add";
        addBtn.classList.remove("added");
        addBtn.disabled = false;
      }, 900);
    } else if (card) {
      openProductModal(+card.dataset.id);
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Filtering & Search
// ────────────────────────────────────────────────────────────────────────────

const applyFilters = () => fetchProducts();

const CATEGORY_ICONS = {
  "Audio": "🎵", "Input": "⌨️", "Power": "⚡", "Wearable": "⌚",
  "Lighting": "💡", "Video": "📹", "Connectivity": "🔌", "Accessories": "📱",
};

function setCategory(value) {
  $("categoryFilter").value = value;
  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.value === value);
  });
  applyFilters();
}

function initCategoryPills() {
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  const container  = $("categoryPills");
  container.innerHTML = '';

  const allPill = document.createElement("button");
  allPill.className    = "category-pill active";
  allPill.dataset.value = "";
  allPill.innerHTML    = `<span class="pill-icon">🛍️</span><span>All</span>`;
  allPill.addEventListener("click", () => setCategory(""));
  container.appendChild(allPill);

  categories.forEach(cat => {
    const pill = document.createElement("button");
    pill.className     = "category-pill";
    pill.dataset.value = cat;
    pill.innerHTML     = `<span class="pill-icon">${CATEGORY_ICONS[cat] || "📦"}</span><span>${cat}</span>`;
    pill.addEventListener("click", () => setCategory(cat));
    container.appendChild(pill);
  });
}

function initFilters() {
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  const catSelect  = $("categoryFilter");
  catSelect.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value       = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  $("searchInput").addEventListener("input",  applyFilters);
  $("categoryFilter").addEventListener("change", e => setCategory(e.target.value));
  $("priceFilter").addEventListener("change",  applyFilters);
  $("sortSelect").addEventListener("change",   applyFilters);
}

// ────────────────────────────────────────────────────────────────────────────
// Product Modal
// ────────────────────────────────────────────────────────────────────────────

function openProductModal(id) {
  const p = products.find(x => x.id === id) || allProducts.find(x => x.id === id);
  if (!p) return;

  const disc  = discountedPrice(p);
  const wished = wishlistIds.has(id);
  const specs = {
    "Rating":   `${p.rating} ⭐ (${p.reviews} reviews)`,
    "Category": p.category,
    "In Stock": "Yes",
    "Shipping": "Free on orders over $50",
  };

  $("modalContent").innerHTML = `
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
          <div class="modal-specs-item"><strong>${k}</strong>${v}</div>
        `).join('')}
      </div>
    </div>
    <div class="modal-actions">
      <button class="modal-add-btn" data-id="${id}">Add to Cart</button>
      <button class="modal-wishlist-btn" data-id="${id}" style="color:${wished ? 'var(--accent)' : 'inherit'};">${wished ? '♥' : '♡'}</button>
    </div>
  `;

  $("productModal").classList.add("open");
  $("modalOverlay").classList.add("open");

  $("modalContent").addEventListener("click", async e => {
    const btn  = e.target.closest(".modal-add-btn");
    const wish = e.target.closest(".modal-wishlist-btn");
    if (btn) {
      btn.disabled = true;
      cart = await apiPost('/api/cart', { productId: +btn.dataset.id });
      updateCartUI();
      btn.textContent  = "Added to cart!";
      btn.style.opacity = "0.7";
      setTimeout(closeModal, 500);
    } else if (wish) {
      const pid = +wish.dataset.id;
      await toggleWishlist(pid);
      wish.textContent = wishlistIds.has(pid) ? '♥' : '♡';
      wish.style.color = wishlistIds.has(pid) ? 'var(--accent)' : 'inherit';
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

async function fetchWishlist() {
  const items = await apiGet('/api/wishlist');
  wishlistIds = new Set(items.map(p => p.id));
  updateWishlistUI(items);
}

async function toggleWishlist(id) {
  const result = await apiPost(`/api/wishlist/${id}`);
  wishlistIds   = new Set(result.wishlistIds);
  const items   = result.wishlistIds.map(wid => allProducts.find(p => p.id === wid)).filter(Boolean);
  updateWishlistUI(items);
}

function renderWishlist(items) {
  const list  = $("wishlistItems");
  const empty = $("wishlistEmpty");

  if (items.length === 0) {
    list.style.display  = "none";
    empty.style.display = "block";
    return;
  }

  list.style.display  = "flex";
  empty.style.display = "none";

  list.innerHTML = items.map(p => {
    const disc = discountedPrice(p);
    return `
      <li class="wishlist-item" data-id="${p.id}">
        <span class="wishlist-item-emoji">${p.emoji}</span>
        <div class="wishlist-item-info">
          <div class="wishlist-item-name">${p.name}</div>
          <div class="wishlist-item-price">${fmt(disc)}</div>
        </div>
        <div class="wishlist-item-actions">
          <button class="wishlist-add-btn" data-id="${p.id}">Add</button>
          <button class="wishlist-remove-btn" data-id="${p.id}">✕</button>
        </div>
      </li>
    `;
  }).join("");
}

function updateWishlistUI(items) {
  const count = wishlistIds.size;
  $("wishlistCount").textContent   = count;
  $("wishlistCount").style.display = count === 0 ? "none" : "flex";
  renderWishlist(items || []);
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

$("wishlistItems").addEventListener("click", async e => {
  const addBtn    = e.target.closest(".wishlist-add-btn");
  const removeBtn = e.target.closest(".wishlist-remove-btn");

  if (addBtn) {
    addBtn.disabled = true;
    cart = await apiPost('/api/cart', { productId: +addBtn.dataset.id });
    updateCartUI();
    addBtn.textContent  = "Added!";
    addBtn.style.opacity = "0.6";
    setTimeout(() => {
      addBtn.textContent   = "Add";
      addBtn.style.opacity  = "1";
      addBtn.disabled = false;
    }, 800);
  } else if (removeBtn) {
    await toggleWishlist(+removeBtn.dataset.id);
    renderProducts();
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Cart
// ────────────────────────────────────────────────────────────────────────────

async function fetchCart() {
  cart = await apiGet('/api/cart');
  updateCartUI();
}

function renderCart() {
  const list   = $("cartItems");
  const footer = $("cartFooter");
  const empty  = $("cartEmpty");

  const hasItems = cart.items.length > 0;
  footer.style.display = hasItems ? "block" : "none";
  empty.style.display  = hasItems ? "none"  : "block";

  list.innerHTML = cart.items.map(({ product: p, quantity, unitPrice }) => `
    <li class="cart-item">
      <span class="cart-item-emoji">${p.emoji}</span>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${fmt(unitPrice)} each</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-id="${p.id}" data-action="dec">−</button>
        <span class="qty-num">${quantity}</span>
        <button class="qty-btn" data-id="${p.id}" data-action="inc">+</button>
      </div>
    </li>
  `).join("");

  $("cartSubtotal").textContent = fmt(cart.total);
  $("cartTotal").textContent    = fmt(cart.total);
}

function updateCartUI() {
  const count = cart.count;
  $("cartCount").textContent   = count;
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

$("cartItems").addEventListener("click", async e => {
  const btn = e.target.closest(".qty-btn");
  if (!btn) return;

  const id   = btn.dataset.id;
  const item = cart.items.find(i => i.product.id === +id);
  if (!item) return;

  if (btn.dataset.action === "inc") {
    cart = await apiPut(`/api/cart/${id}`, { quantity: item.quantity + 1 });
  } else if (item.quantity > 1) {
    cart = await apiPut(`/api/cart/${id}`, { quantity: item.quantity - 1 });
  } else {
    cart = await apiDelete(`/api/cart/${id}`);
  }
  updateCartUI();
});

document.querySelector(".checkout-btn")?.addEventListener("click", async () => {
  const result = await apiPost('/api/checkout');
  cart = { items: [], count: 0, total: 0 };
  updateCartUI();
  closeCart();
  alert("Order placed! Thanks for shopping at SimpleShop. Order total: " + fmt(result.total));
});

// ────────────────────────────────────────────────────────────────────────────
// Init
// ────────────────────────────────────────────────────────────────────────────

async function init() {
  allProducts = await apiGet('/api/products');
  products    = [...allProducts];

  initFilters();
  initCategoryPills();
  initGridEvents();
  renderProducts();

  await Promise.all([fetchCart(), fetchWishlist()]);
}

init().catch(console.error);
