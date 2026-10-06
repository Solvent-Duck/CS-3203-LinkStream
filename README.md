# LinkStream

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
| Database | SQLite |
| Search | Initial standalone prototype |
| Shortcut persistence and redirection | Planned |
| Automated tests / CI | Not yet established |

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

The backend runs locally on port `3333` by default. Keep `.env`, access tokens, and other secrets out of commits.

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

`.github/workflows/frontend-ci.yml` runs unit tests, frontend lint, TypeScript type-check, and the production build on relevant pushes and pull requests. On a push to `main`, the production deployment job waits for all CI checks to pass, then deploys that commit to Vercel. Pull requests run CI without deploying.

Before deployment, create a Vercel project with its **Root Directory** set to `frontend`. From `frontend`, run `vercel link` to obtain the account and project IDs. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as repository secrets under **GitHub → Settings → Secrets and variables → Actions**. Keep the token private and do not commit the generated `.vercel` folder. Use this GitHub Actions workflow as the production deployment path; avoid an automatic Vercel Git integration that could deploy without the CI checks. The backend is not included because it currently uses local SQLite and lacks production database configuration.
