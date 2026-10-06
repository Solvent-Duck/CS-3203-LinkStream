# LinkStream

[![Frontend CI/CD](https://github.com/Solvent-Duck/CS-3203-LinkStream/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Solvent-Duck/CS-3203-LinkStream/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/Solvent-Duck/CS-3203-LinkStream/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Solvent-Duck/CS-3203-LinkStream/actions/workflows/backend-ci.yml)

**Memorable internal short links for teams**

CS 3203 — Software Engineering · Fall 2026 · Group A

LinkStream is a student software engineering project inspired by GoLinks. It gives teams memorable shortcuts such as `go/sprint`, `go/api-docs`, and `go/standup` for resources that would otherwise be scattered across documents, chats, and bookmarks.

> **Status:** Early development. The repository currently includes a frontend/backend scaffold and an initial search prototype. Core shortcut creation, persistence, and redirection are still in development.

## Product overview

LinkStream is intended to provide a shared, searchable directory of team resources. A teammate creates a short alias for a destination, shares that alias with the team, and others can either open it directly or discover it through search.

Planned capabilities include:

- Creating, editing, and deleting shortcuts
- Searching a shared link directory
- Redirecting `go/` aliases to saved destinations
- Tags and resource ownership
- Team namespaces and access control
- Usage analytics and link-health checks

## Current implementation

| Area | State |
| --- | --- |
| Frontend | Next.js / React scaffold |
| Backend | AdonisJS API scaffold with account authentication |
| Database | SQLite locally and in CI; PostgreSQL on Railway |
| Search | Initial standalone prototype |
| Shortcut persistence and redirection | Planned |
| Automated tests / CI | Frontend CI/CD (test, lint, type-check, build, and Vercel production deploy) and Backend CI (lint, type-check, migrations, test, and build) |

The current architecture is expected to evolve as the team implements the product.

## Repository structure

```text
frontend/                  Next.js frontend
backend/                   AdonisJS backend
  app/controllers/         Controllers
  app/models/              Models
  app/validators/          Validation
  database/migrations/     Database migrations
  start/routes.ts          API routes
```

## Development setup

**Requirements:** Git, Node.js 24+, and npm.

```bash
git clone https://github.com/Solvent-Duck/CS-3203-LinkStream.git
cd CS-3203-LinkStream
```

### Backend

```bash
cd backend
npm ci
cp .env.example .env
node ace generate:key
node ace migration:run
npm run dev
```

The backend runs locally on port `3333` by default and uses SQLite when `NODE_ENV` is `development` or `test`. Production on Railway uses PostgreSQL. Keep `.env`, access tokens, `APP_KEY`, and other secrets out of commits. See [Backend on Railway](#backend-on-railway).

### Frontend

From the repository root in a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend runs locally on port `3000` by default.

## API documentation

Sprint 1 API payloads and JSON schemas are documented in [`docs/api/payloads-and-json-schemas.md`](docs/api/payloads-and-json-schemas.md). The schema bundle is transport-neutral so route definitions and HTTP error semantics can evolve independently.

## Validation

Available project checks include:

```bash
# frontend/
npm run lint
npm run build
```

```bash
# backend/
npm run lint
npm run typecheck
npm test
npm run build
```

Testing and CI coverage will expand with the application.

## Code management

The team will use Git branches as needed to support feature development, parallel work, and merge-conflict management. Branching practices may evolve with the project and course requirements.

Changes should remain reasonably scoped, use descriptive commits, and be reviewed before integration when appropriate. The team will preserve the real Git and pull-request history needed for course code-management deliverables.

## Team

**Developed and maintained by Group A — CS 3203, Fall 2026**

- Sithabiso Hlanze
- Isaiah Bergstrom
- Thandeka Madonsela
- Hanatou Yahaya Idi
- Lana Johnson

Current Sprint 1 API ownership includes:

- **Sithabiso Hlanze:** API routes and endpoint documentation
- **Isaiah Bergstrom:** data payloads and JSON schemas
- **Hanatou Yahaya Idi:** HTTP status codes and error formats
- **Thandeka Madonsela:** API contract validation and mock payloads

Other shared integration, review, and QA work is assigned as the sprint progresses rather than treated as permanent ownership.

## Repository

The active project repository is maintained under **Solvent-Duck/CS-3203-LinkStream**.

Course assignments and submission requirements remain in OU Canvas.

## License

No repository-wide `LICENSE` file is currently included. Confirm the team's intended licensing before reusing or distributing the project.

## Frontend CI/CD

`.github/workflows/frontend-ci.yml` runs unit tests, frontend lint, TypeScript type-check, and the production build on every pull request and on pushes to `main`. On a push to `main`, the production deployment job waits for those checks, then deploys that commit to Vercel. Pull requests run CI without deploying. `.github/workflows/backend-ci.yml` runs backend lint, type-check, migrations, tests, and the production build on the same events.

Before deployment, create a Vercel project with its **Root Directory** set to `frontend`. From `frontend`, run `vercel link` to obtain the account and project IDs. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as repository secrets under **GitHub → Settings → Secrets and variables → Actions**. Keep the token private and do not commit the generated `.vercel` folder. Use this GitHub Actions workflow as the production deployment path; avoid an automatic Vercel Git integration that could deploy without the CI checks.

Set `NEXT_PUBLIC_API_URL` on the Vercel project to the Railway API public URL. Until that service exists, treat `https://YOUR-RAILWAY-API.up.railway.app` as a placeholder. Copy the real hostname from the Railway service after it is deployed. Do not invent a Railway URL. `NEXT_PUBLIC_` values are inlined when the frontend is built, so changing this variable requires a new production deploy (a push to `main`, or a rerun of this workflow). Local `npm run dev` keeps calling `http://localhost:3333` when the variable is unset. The API client is `frontend/app/lib/api.ts` (`API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"`).

## Backend on Railway

The API is an AdonisJS 7 app and is not part of the Vercel workflow. Deploy it as its own Railway service.

1. Create a Railway project and add a PostgreSQL database.
2. Create a service from this GitHub repo. Set **Root Directory** to `backend`. The app needs Node.js 24 (`backend/package.json` `engines`, `backend/.node-version`, and `backend/nixpacks.toml` if the builder is Nixpacks). Railpack is Railway's default builder and installs dev dependencies so `npm run build` can compile TypeScript.
3. Add the variables below on the API service. Reference the Postgres plugin's `DATABASE_URL` (the private `*.railway.internal` URL). Do not paste a guessed public URL.
4. Confirm the deploy commands. `backend/railway.toml` sets them, and `npm start` is `node build/bin/server.js`. Railway's config-as-code file is deprecated for services created now and stops being read on 2026-12-01. If the deployment does not show these commands, enter them in the service settings:

   - **Start command:** `node build/bin/server.js`
   - **Pre-deploy command:** `cd build && node ace migration:run --force`
   - **Healthcheck path:** `/`

   `node ace build` writes the server to `build/bin/server.js` (the same file is `bin/server.js` if you `cd build`). The pre-deploy command is the production form of `node ace migration:run --force`. Adonis refuses to migrate when `NODE_ENV=production` unless `--force` is set. From a local checkout of `backend/` the source command is `node ace migration:run --force`.

5. After the API is live, copy its public Railway URL into Vercel as `NEXT_PUBLIC_API_URL` and redeploy the frontend.

### Railway variables

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` (required; `localhost` is not reachable from Railway's proxy) |
| `PORT` | Leave unset. Railway injects it. |
| `APP_KEY` | Output of `node ace generate:key`. Unique per environment. Never commit it. |
| `APP_URL` | The service's public URL, for example `https://YOUR-RAILWAY-API.up.railway.app`. Replace the placeholder with the hostname Railway assigns. |
| `LOG_LEVEL` | `info` |
| `TZ` | `UTC` |
| `SESSION_DRIVER` | `cookie` |
| `DATABASE_URL` | Variable reference to the Postgres service. Preferred over discrete `DB_*` vars. |
| `CORS_ORIGIN` | `https://project-wwc99.vercel.app` |
| `DB_CONNECTION` | Optional. Production already defaults to `pg`. |
| `DB_SSL` | Leave unset for the private URL. Set `true` only if `DATABASE_URL` is the public proxy. |

If `DATABASE_URL` is not available, set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE` instead.

### Vercel variable

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The same public Railway URL as `APP_URL`, with no trailing slash. Rebuild after setting it. |

`backend/.env.example` lists the same keys. Local `cp .env.example .env` stays on SQLite and `HOST=localhost`.

### Cookie, CORS, and host binding

- Login uses a bearer token in `localStorage`, not a session cookie. The API still sets a session cookie with `SameSite=Lax` and, in production, `Secure`. Browsers do not send that cookie on cross-site `fetch` calls from Vercel to Railway. Cookie-based login would need `SameSite=None` (and `Secure`) plus `credentials: 'include'` on the frontend.
- Production CORS allows `https://project-wwc99.vercel.app`, preview hosts `https://project-wwc99-*.vercel.app`, and any exact origins in `CORS_ORIGIN`. `credentials` is enabled, so the API echoes the request origin instead of `*`. Other `*.vercel.app` sites are rejected.
- `HOST` must be `0.0.0.0`. The app refuses to boot in production when `HOST` is `localhost`, `127.0.0.1`, or `::1`.
- Production trusts Railway's proxy (`trustProxy`) so `X-Forwarded-Proto` is treated as HTTPS.
