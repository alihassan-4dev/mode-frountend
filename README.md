# Frontend

Vite + React frontend for the wellness dashboard, chat assistant, auth, and social integrations.

## Current behavior

- Auth uses the backend JWT API
- Dashboard pulls live summary data from `/api/dashboard/summary`
- Chat uses persisted backend sessions from `/api/chat/*`
- Integrations use the backend Meta OAuth endpoints
- Settings still reads profile data from `/api/me`

## Environment

Copy `.env.example` to `.env`.

```bash
VITE_API_URL=http://127.0.0.1:8000
```

## Run

```bash
cd frontend
npm install
npm run dev
```

## Test and build

```bash
npm test
npm run build
```
