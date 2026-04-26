# Motorcycle Maintenance Tracker API

This is a simple grading-friendly REST API for the final project. It uses Node.js, Express, PostgreSQL, Prisma, JWT authentication, bcrypt password hashing, Swagger documentation, seed data, and Render deployment setup.

## Resources

- Users: authentication and authorization
- Motorcycles: full CRUD
- Service Records: full CRUD
- Maintenance Reminders: full CRUD

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a PostgreSQL database.

3. Copy `.env.example` to `.env` and update `DATABASE_URL`:

```bash
cp .env.example .env
```

4. Run migrations and seed data:

```bash
npx prisma migrate deploy
npx prisma db seed
```

5. Start the server:

```bash
npm run dev
```

6. Open Swagger UI:

```text
http://localhost:3000/api-docs
```

## Seed Login Credentials

| Role | Email | Password |
|---|---|---|
| Regular owner | owner@example.com | Password123! |
| Regular non-owner | not-owner@example.com | Password123! |
| Admin | admin@example.com | Password123! |

## Render Deployment

1. Push this project to a public GitHub repository.
2. Create a PostgreSQL database on Render.
3. Create a Render Web Service from the GitHub repository.
4. Add these environment variables:
   - `DATABASE_URL`: use the Render PostgreSQL external database URL.
   - `JWT_SECRET`: any strong random secret.
   - `NODE_VERSION`: `22`
5. Use this build command:

```bash
npm run render-build
```

6. Use this start command:

```bash
npm start
```

The seed script runs during deployment through the build command, so sample data is available for grading.

## Important URLs

Replace these after deployment:

- Repository URL: `PASTE-YOUR-GITHUB-REPO-LINK-HERE`
- Live API URL: `PASTE-YOUR-RENDER-URL-HERE`
- Swagger UI URL: `PASTE-YOUR-RENDER-URL-HERE/api-docs`
