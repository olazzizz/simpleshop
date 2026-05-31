# SimpleShop – A Modern Storefront App

A lightweight e-commerce storefront with a vanilla JS frontend and a Node.js/Express backend. Supports user registration and login, product browsing, filtering, cart management, and wishlist — all backed by a REST API with PostgreSQL-persisted state.

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
- **Persistent cart** — survives server restarts via PostgreSQL

### ❤️ Wishlist
- **Toggle wishlist** with heart icon on any product or modal
- **Dedicated wishlist drawer** to view and manage saved items
- **Wishlist count** badge in the header
- **Persistent wishlist** — survives server restarts via PostgreSQL

### 📱 Product Details Modal
- **Click any product** to view full details in a modal
- **Large emoji thumbnail**, full description, and specs table
- **Quick add to cart** and wishlist toggle from the detail view

### 👤 User Accounts
- **Register and log in** via a modal with Login / Create Account tabs
- **Per-user cart and wishlist** — persisted in PostgreSQL and restored on every login
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
- PostgreSQL 14+ (or use the Docker/Podman container)

### Installation & Running

Start a local PostgreSQL instance:

```bash
podman run -d --name pg \
  -e POSTGRES_DB=simpleshop \
  -e POSTGRES_USER=simpleshop \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  postgres:16
```

Then start the backend:

```bash
cd backend
npm install        # first time only
PGPASSWORD=dev npm run dev
```

Visit `http://localhost:3000`. Override the port with `PORT=8080 npm start`.

The backend serves both the API and the frontend static files — no separate frontend server needed. On first start the schema is created automatically and the product catalogue is seeded.

## File Structure

```
.
├── index.html              # App shell — modals, drawers, layout
├── styles.css              # All styling and responsive design
├── app.js                  # Frontend logic — API calls, rendering, events
├── Dockerfile              # Container image (UBI9 Node 22)
├── backend/
│   ├── server.js           # Express app setup, session config, static serving
│   ├── package.json
│   ├── data/
│   │   └── products.js     # Product catalogue (seed data)
│   ├── db/
│   │   └── database.js     # PostgreSQL pool, schema creation, product seeding
│   ├── middleware/
│   │   └── requireAuth.js  # 401 guard for protected routes
│   └── routes/
│       ├── auth.js         # POST /api/auth/register|login|logout, GET /api/auth/me
│       ├── products.js     # GET /api/products, GET /api/products/:id
│       ├── cart.js         # GET/POST /api/cart, PUT/DELETE /api/cart/:id
│       ├── wishlist.js     # GET /api/wishlist, POST /api/wishlist/:id
│       └── checkout.js     # POST /api/checkout
├── k8s/
│   ├── deployment.yml      # Kubernetes Deployment for the app
│   ├── service.yml         # ClusterIP Service (port 80 → 3000)
│   ├── postgres.yml        # PostgreSQL Deployment, PVC, and ClusterIP Service
│   └── secret.yml          # SESSION_SECRET and PGPASSWORD
├── helm/
│   ├── Chart.yaml
│   ├── values.yaml                  # Default values (no real secrets)
│   ├── values-openshift-dev.yaml    # OpenShift dev environment overlay
│   └── templates/
│       ├── _helpers.tpl               # Named template helpers
│       ├── secret.yaml
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── route.yaml                 # OpenShift Route (enabled via openshift.enabled)
│       ├── postgres-deployment.yaml
│       ├── postgres-service.yaml
│       ├── postgres-pvc.yaml
│       ├── backup-cronjob.yaml        # Scheduled pg_dump CronJob
│       └── backup-pvc.yaml            # PVC for in-cluster backup storage
├── scripts/
│   ├── db-backup.sh        # On-demand backup: triggers in-cluster job + downloads locally
│   └── db-restore.sh       # Restore database from a local backup file
└── README.md
```

## Database

SimpleShop uses **PostgreSQL** (via the `pg` Node.js client) for data persistence. The schema is created automatically on startup.

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
| `PGHOST` | `localhost` | PostgreSQL host |
| `PGPORT` | `5432` | PostgreSQL port |
| `PGDATABASE` | `simpleshop` | Database name |
| `PGUSER` | `simpleshop` | Database user |
| `PGPASSWORD` | _(none)_ | Database password |
| `PORT` | `3000` | HTTP port |
| `SESSION_SECRET` | `simpleshop-dev-secret` | Session signing secret (change in production) |

## Running with Podman

Build and run the container locally (run from the project root):

```bash
podman build -t simpleshop:latest .
podman run --rm -p 3000:3000 \
  -e PGHOST=host.containers.internal \
  -e PGUSER=simpleshop \
  -e PGPASSWORD=dev \
  -e PGDATABASE=simpleshop \
  simpleshop:latest
```

Visit `http://localhost:3000` (requires a PostgreSQL instance accessible at `host.containers.internal:5432`).

## Kubernetes Deployment

Two deployment methods are available: **Helm** (recommended) or raw manifests.

### Helm

The Helm chart lives in `helm/` and deploys the app together with a PostgreSQL instance. Secret values are passed at install time and never need to be committed.

#### Prerequisites

- [Helm 3](https://helm.sh/docs/intro/install/)
- A registry pull secret for the app image

#### 1. Create the registry pull secret

```bash
kubectl create secret docker-registry quay-pull-secret \
  --docker-server=<your-registry> \
  --docker-username=<your-username> \
  --docker-password='<your-password-or-token>'
```

#### 2. Install the chart

```bash
helm install simpleshop ./helm \
  --set sessionSecret=<your-session-secret> \
  --set postgresql.password=<your-db-password>
```

To override the image:

```bash
helm install simpleshop ./helm \
  --set image.repository=<your-registry>/simpleshop \
  --set image.tag=latest \
  --set sessionSecret=<your-session-secret> \
  --set postgresql.password=<your-db-password>
```

#### 3. Access the app

```bash
kubectl port-forward service/simpleshop 3000:80
```

Visit `http://localhost:3000`.

#### Upgrade after changes

```bash
helm upgrade simpleshop ./helm \
  --set sessionSecret=<your-session-secret> \
  --set postgresql.password=<your-db-password>
```

#### Uninstall

```bash
helm uninstall simpleshop
```

#### Using an external PostgreSQL

To connect to an existing PostgreSQL instance instead of deploying one:

```bash
helm install simpleshop ./helm \
  --set postgresql.enabled=false \
  --set externalPostgresql.host=<host> \
  --set externalPostgresql.user=<user> \
  --set externalPostgresql.password=<password> \
  --set externalPostgresql.database=<database> \
  --set sessionSecret=<your-session-secret>
```

---

### OpenShift

The chart has first-class OpenShift support via the `values-openshift-dev.yaml` overlay, which:

- Switches the PostgreSQL image to `registry.redhat.io/rhel9/postgresql-16` (supports OpenShift's arbitrary UID assignment and uses `POSTGRESQL_*` env vars)
- Creates an edge-terminated **Route** for external HTTPS access (auto-generated hostname)

#### Prerequisites

- `oc` CLI logged in to your OpenShift cluster
- Pull secret for `quay.io` (app image)
- Pull secret for `registry.redhat.io` (PostgreSQL image) — link it to the default service account after creation

#### 1. Create the project and pull secrets

```bash
oc new-project simpleshop-dev

# App image pull secret
kubectl create secret docker-registry quay-pull-secret \
  --docker-server=quay.io \
  --docker-username=<your-username> \
  --docker-password='<your-token>'

# Red Hat registry pull secret
kubectl create secret docker-registry rh-registry-secret \
  --docker-server=registry.redhat.io \
  --docker-username=<your-rh-username> \
  --docker-password='<your-rh-token>'

# Link both secrets to the simpleshop service account (created by the chart)
# Run helm install first, then link — or pre-create the service account
oc secrets link simpleshop quay-pull-secret --for=pull -n simpleshop-dev
oc secrets link simpleshop rh-registry-secret --for=pull -n simpleshop-dev
```

#### 2. Install the chart

```bash
helm install simpleshop ./helm \
  -f helm/values-openshift-dev.yaml \
  --namespace simpleshop-dev \
  --set sessionSecret=<your-session-secret> \
  --set postgresql.password=<your-db-password>
```

#### 3. Access the app

OpenShift automatically assigns a public hostname to the Route:

```bash
oc get route simpleshop -n simpleshop-dev
```

The `HOST/PORT` column shows the URL — open it in a browser (HTTPS, redirects from HTTP).

#### Upgrade

```bash
helm upgrade simpleshop ./helm \
  -f helm/values-openshift-dev.yaml \
  --namespace simpleshop-dev \
  --set sessionSecret=<your-session-secret> \
  --set postgresql.password=<your-db-password>
```

---

### Raw manifests

The `k8s/` directory contains plain Kubernetes manifests for direct `kubectl` use.

#### 1. Set secrets

Edit `k8s/secret.yml` and replace the placeholder values:

```yaml
stringData:
  SESSION_SECRET: "your-secret-here"
  PGPASSWORD: "your-db-password-here"
```

#### 2. Build and push the image

```bash
podman build -t <your-registry>/simpleshop:latest .
podman push <your-registry>/simpleshop:latest
```

#### 3. Update the image reference

In `k8s/deployment.yml`, set the `image` field to match your registry.

#### 4. Create the registry pull secret

```bash
kubectl create secret docker-registry quay-pull-secret \
  --docker-server=<your-registry> \
  --docker-username=<your-username> \
  --docker-password='<your-password-or-token>'
```

#### 5. Apply the manifests

```bash
kubectl apply -f k8s/
```

#### 6. Access the app

```bash
kubectl port-forward service/simpleshop 3000:80
```

Visit `http://localhost:3000`.

## Database Backup & Restore

### How it works

Two layers of backup are in place when the Helm chart is deployed:

| Layer | Mechanism | Survives `helm uninstall` | Survives cluster wipe |
|-------|-----------|:---:|:---:|
| In-cluster | CronJob → backups PVC | Yes (PVC is kept) | Depends on storage backend |
| Local | `scripts/db-backup.sh` download | Yes | Yes |

The CronJob runs `pg_dump` daily at 02:00, writes a timestamped `.sql.gz` to a dedicated `simpleshop-backups` PVC, and removes files older than 7 days. Both the data PVC and the backups PVC are annotated with `helm.sh/resource-policy: keep` so they are never deleted by Helm.

### On-demand backup

Run from the project root:

```bash
./scripts/db-backup.sh [release-name]
```

This will:
1. Prompt for confirmation to start the backup immediately
2. Trigger a one-off Kubernetes Job from the CronJob (writes to the in-cluster backups PVC)
3. Download a copy to your local machine as `simpleshop-backup-YYYYMMDD-HHMMSS.sql.gz`

Always run this before wiping a cluster or migrating to a new one.

### Tune the schedule

Override the default schedule and retention via Helm values:

```bash
helm upgrade simpleshop ./helm \
  --set backup.schedule="0 3 * * *" \   # run at 03:00 instead
  --set backup.retention=14 \            # keep 14 days instead of 7
  --set sessionSecret=<secret> \
  --set postgresql.password=<password>
```

### Restore

```bash
./scripts/db-restore.sh simpleshop-backup-YYYYMMDD-HHMMSS.sql.gz [release-name]
```

This will prompt for confirmation, then pipe the backup file into `psql` on the running postgres pod, overwriting existing data.

### Cluster migration flow

```bash
# 1. Download a fresh backup before touching the cluster
./scripts/db-backup.sh

# 2. Tear down and/or stand up the new cluster
helm uninstall simpleshop   # or wipe the cluster entirely
helm install simpleshop ./helm --set sessionSecret=<s> --set postgresql.password=<p>

# 3. Restore data into the new cluster
./scripts/db-restore.sh simpleshop-backup-YYYYMMDD-HHMMSS.sql.gz
```

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
- **PostgreSQL persistence** — users, cart, wishlist, and orders survive server restarts; schema created automatically on startup
- **Express backend** with `express-session`; cart and wishlist keyed by `user_id`
- **Server-side filtering** — search, category, price, and sort all handled by the API
- **Event delegation** — efficient DOM event handling on product grid, cart, and wishlist
- **Responsive design** — `clamp()` and CSS Grid for fluid layout

## License

Free to use, modify, and distribute.

---

**Questions?** Open an issue or submit a pull request!
