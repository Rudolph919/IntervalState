# IntervalState – Docker / Podman

Run the full stack with **Podman** and **podman-compose** (or Docker Compose).

## Stack

- **intervalstate_db**: MySQL 8.0, database `intervalstate`, port **3312** (host)
- **intervalstate_app**: PHP 8.3-FPM (Laravel)
- **intervalstate_queue**: Laravel queue worker (optional; use `--profile with-queue`)
- **intervalstate_web**: nginx → **http://localhost:8085**
- **intervalstate_node**: Node 20, Vite dev server → **http://localhost:5178**

## Setup

```bash
cp .env.example .env
# Edit .env: APP_URL=http://localhost:8085

podman compose up -d
# First time only: key:generate and migrate
podman compose exec intervalstate_app php artisan key:generate
podman compose exec intervalstate_app php artisan migrate --force
```

Use `podman compose up -d --build` if images need to be built (e.g. first clone).

## URLs

- **Web**: http://localhost:8085
- **Vite HMR**: http://localhost:5178
