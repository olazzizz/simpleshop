# Database

SimpleShop uses **PostgreSQL** via the `pg` Node.js client. The schema is created automatically on startup and the product catalogue is upserted on every start.

## Schema

| Table | Purpose |
|-------|---------|
| `users` | Registered users (`username`, `email`, `password_hash`) |
| `products` | Product catalogue, seeded from `data/products.js` on startup |
| `cart_items` | Per-user cart rows (`user_id`, `product_id`, `quantity`) |
| `wishlist_items` | Per-user wishlist rows (`user_id`, `product_id`) |
| `orders` | Order header written on checkout (`user_id`, `total`, `created_at`) |
| `order_items` | Line items per order (`order_id`, `product_id`, `quantity`, `unit_price`) |

---

## Backup & Restore

Two backup layers are active when the Helm chart is deployed:

| Layer | Mechanism | Survives `helm uninstall` | Survives cluster wipe |
|-------|-----------|:---:|:---:|
| In-cluster | CronJob → backups PVC | Yes | Depends on storage backend |
| Local | `scripts/db-backup.sh` | Yes | Yes |

The CronJob runs `pg_dump` daily at 02:00, writes timestamped `.sql.gz` files to the `simpleshop-backups` PVC, and removes files older than 7 days. Both PVCs are annotated with `helm.sh/resource-policy: keep`.

### On-demand backup

```bash
./scripts/db-backup.sh [release-name]
```

Prompts for confirmation, then triggers an in-cluster Job and downloads the dump locally as `simpleshop-backup-YYYYMMDD-HHMMSS.sql.gz`. Always run this before wiping a cluster.

### Tune the schedule

```bash
helm upgrade simpleshop ./helm \
  --set backup.schedule="0 3 * * *" \
  --set backup.retention=14 \
  --set sessionSecret=<secret> \
  --set postgresql.password=<password>
```

### Restore

```bash
./scripts/db-restore.sh simpleshop-backup-YYYYMMDD-HHMMSS.sql.gz [release-name]
```

Prompts for confirmation, then pipes the file into `psql` on the running postgres pod, overwriting existing data.

### Cluster migration

```bash
# 1. Download a fresh backup
./scripts/db-backup.sh

# 2. Tear down / stand up the new cluster
helm uninstall simpleshop
helm install simpleshop ./helm --set sessionSecret=<s> --set postgresql.password=<p>

# 3. Restore
./scripts/db-restore.sh simpleshop-backup-YYYYMMDD-HHMMSS.sql.gz
```
