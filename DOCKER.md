<<<<<<< HEAD
# Docker Setup

This project can now run as a full stack with Docker:

- `frontend` at `http://localhost:5173`
- `backend` at `http://localhost:3001`
- `postgres` exposed on host port `5433`

## Start everything

```bash
docker compose up -d --build
```

## Stop everything
=======
# Docker Guide

## Start services

```bash
docker compose up --build
```

## Stop services
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102

```bash
docker compose down
```

<<<<<<< HEAD
## Useful commands

```bash
docker compose ps
docker compose logs backend --tail=100
docker compose logs frontend --tail=100
docker compose logs postgres --tail=100
```

## Notes

- The backend container runs `npm run migrate && npm start` on startup.
- The frontend is built with Vite and served by Nginx.
- The frontend proxies `/api` requests to the backend container.
- For local non-Docker backend runs, the default PostgreSQL host is `127.0.0.1:5433`.
=======
Frontend se chay qua Nginx, backend se chay bang Node.js.
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
