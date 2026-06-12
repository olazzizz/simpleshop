# SimpleShop

A lightweight e-commerce storefront — vanilla JS frontend, Node.js/Express backend, PostgreSQL persistence.

Features: product catalogue with search & filtering, shopping cart, wishlist, user accounts, checkout.

## Quick start

```bash
# Start PostgreSQL
podman run -d --name pg \
  -e POSTGRES_DB=simpleshop -e POSTGRES_USER=simpleshop -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 postgres:16

# Start the app
cd backend && npm install && PGPASSWORD=dev npm run dev
```

Visit `http://localhost:3000`. → Full setup: [docs/getting-started.md](docs/getting-started.md)

## Documentation

| Topic | Doc |
|-------|-----|
| Local dev & container run | [docs/getting-started.md](docs/getting-started.md) |
| Deploy (Kustomize / Helm / raw manifests) | [docs/deployment.md](docs/deployment.md) |
| Observability (OpenTelemetry + Tempo) | [docs/observability.md](docs/observability.md) |
| Database schema, backup & restore | [docs/database.md](docs/database.md) |
| API reference | [docs/api.md](docs/api.md) |
| Customization & architecture | [docs/customization.md](docs/customization.md) |

## Repository layout

```
.
├── index.html / app.js / styles.css   # Frontend
├── Dockerfile                         # UBI9 Node 22 container image
├── backend/                           # Express API
│   ├── db/database.js                 # PostgreSQL pool, schema, seed
│   ├── routes/                        # auth, products, cart, wishlist, checkout
│   └── data/products.js               # Product catalogue
├── helm/                              # Helm chart
│   ├── values.yaml
│   ├── values-openshift-dev.yaml
│   └── templates/
├── kustomize/                         # Environment overlays (dev / prod)
│   └── overlays/
│       ├── dev/
│       └── prod/
├── k8s/                               # Raw Kubernetes manifests
├── scripts/                           # db-backup.sh, db-restore.sh
└── docs/                              # Full documentation
```

## License

Free to use, modify, and distribute.
