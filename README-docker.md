# IntervalState – Docker / Podman

Run the full stack with **Podman** and **podman-compose** (or Docker Compose).

## Stack

- **intervalstate_db**: MySQL 8.0, database `intervalstate`, port **3312** (host)
- **intervalstate_app**: PHP 8.3-FPM (Laravel)
- **intervalstate_queue**: Laravel queue worker (optional; use `--profile with-queue`)
- **intervalstate_web**: nginx → **http://localhost:8085**
- **intervalstate_node**: Node 20, Vite dev server → **http://localhost:5178**

## One-time setup

```bash
cp .env.example .env
# Edit .env: APP_URL=http://localhost:8085

podman compose up -d --build
podman compose exec intervalstate_app php artisan key:generate
podman compose exec intervalstate_app php artisan migrate --force
```

## URLs

- **Without proxy**: http://localhost:8085 (web), http://localhost:5178 (Vite HMR)
- **With proxy**: https://intervalstate.docker
