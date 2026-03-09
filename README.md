# CipherCore Academy v2

A clean full-stack learning platform built with Next.js 14 + Express + PostgreSQL.

## Deploy to Railway (5 minutes)

1. Push this repo to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add 3 services:
   - Backend: root directory = `backend`
   - Frontend: root directory = `frontend`
   - PostgreSQL: Add Plugin
4. Backend environment variables:
   - `DATABASE_URL` = auto-set by Railway
   - `JWT_SECRET` = any long random string
   - `FRONTEND_URL` = your frontend Railway URL
   - `NODE_ENV` = production
5. Frontend environment variables:
   - `NEXT_PUBLIC_API_URL` = your backend Railway URL (no trailing slash)
6. Deploy both services

## Make yourself admin
After registering, run in Railway PostgreSQL shell:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Local Development
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```
