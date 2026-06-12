# Getting Started

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or use the Podman container below)

## Run locally

Start a PostgreSQL instance:

```bash
podman run -d --name pg \
  -e POSTGRES_DB=simpleshop \
  -e POSTGRES_USER=simpleshop \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  postgres:16
```

Start the backend:

```bash
cd backend
npm install        # first time only
PGPASSWORD=dev npm run dev
```

Visit `http://localhost:3000`. Override the port with `PORT=8080 npm start`.

The backend serves both the API and the frontend static files — no separate frontend server needed. The schema is created and the product catalogue is seeded automatically on first start.

## Run as a container

Build and run from the project root:

```bash
podman build -t simpleshop:latest .
podman run --rm -p 3000:3000 \
  -e PGHOST=host.containers.internal \
  -e PGUSER=simpleshop \
  -e PGPASSWORD=dev \
  -e PGDATABASE=simpleshop \
  simpleshop:latest
```

Requires a PostgreSQL instance accessible at `host.containers.internal:5432`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PGHOST` | `localhost` | PostgreSQL host |
| `PGPORT` | `5432` | PostgreSQL port |
| `PGDATABASE` | `simpleshop` | Database name |
| `PGUSER` | `simpleshop` | Database user |
| `PGPASSWORD` | _(none)_ | Database password |
| `PORT` | `3000` | HTTP port |
| `SESSION_SECRET` | `simpleshop-dev-secret` | Session signing secret — change in production |
