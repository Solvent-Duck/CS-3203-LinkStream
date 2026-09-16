# LinkStream

**Memorable internal short links for teams**

CS 3203 — Software Engineering · Fall 2026 · Group A

LinkStream is a student software engineering project inspired by [GoLinks](https://www.ycombinator.com/companies/golinks). Its core idea is to turn long URLs into memorable internal shortcuts that teammates can create, share, and use, such as `go/sprint`, `go/api-docs`, and `go/standup`. A shared, searchable directory helps everyone discover the shortcuts available to their team.

> **Project status:** Early development. The repository contains a working, standalone search prototype and a separate frontend/backend scaffold. Shortcut redirection and the full LinkStream application are still planned.

## Contents

- [Product overview](#product-overview)
- [Features and current progress](#features-and-current-progress)
- [Branches and repository structure](#branches-and-repository-structure)
- [Technology stack](#technology-stack)
- [Installation and setup](#installation-and-setup)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Validation](#validation)
- [Support](#support)
- [Contributing and code management](#contributing-and-code-management)
- [Team](#team)
- [Course references](#course-references)
- [License](#license)

## Product overview

Teams use many tools, while the links to those tools often live in disconnected documents, chat histories, and bookmarks. LinkStream aims to give a resource one short, recognizable name that everyone on the team can remember and share. 

**Who it serves:** Software engineers and DevOps engineers, engineering managers and technical leads, and new teammates learning where project resources live.

**Why it matters:** A shared directory can reduce repeated requests for links, simplify onboarding, and make frequently used resources easier to find and maintain.

### Intended experience

These examples illustrate the planned product; the destinations are placeholders.

| Shared shortcut | Example destination | What teammates remember |
| --- | --- | --- |
| `go/sprint` | `https://tools.example.com/projects/linkstream/sprints/current` | The team's current sprint board |
| `go/api-docs` | `https://docs.example.com/linkstream/api/reference` | The API reference |
| `go/standup` | `https://meet.example.com/linkstream/weekly-standup` | The team's meeting room |

1. **Create:** A teammate assigns a short name to a destination URL.
2. **Share:** The team uses the same shortcut in conversations and documentation.
3. **Open:** Entering the shortcut takes the teammate to its saved destination.
4. **Discover:** Someone who does not know the shortcut searches the shared directory.

Shortcut resolution still needs to be implemented, including a way for the browser to route `go/` addresses to LinkStream. The current local setup does not make those addresses work. Tags, ownership, team namespaces, and link-health checks are additional goals from the team's product vision.

## Features and current progress

| Capability | Current state |
| --- | --- |
| Link directory prototype | Implemented as `index.html` on `feat/app-shell-and-search`, with two sample resource cards. |
| Search prototype | Case-insensitive substring filtering across each card's title, alias, description, and displayed path, updated on keyboard input. |
| Application frontend | Next.js starter application on `main`; it currently displays the starter page. |
| Account API | AdonisJS scaffold on `main` includes signup, login, authenticated profile access, and logout, with SQLite user and access-token migrations. |
| Link creation, editing, and persistence | Planned. The prototype's cards are hardcoded. |
| `go/` shortcut resolution | Planned. Displayed aliases do not currently redirect or register a `go` hostname. |
| Tags, ownership, and scoped team namespaces | Planned. |
| Role-based access control | Planned; the account scaffold does not implement team roles. |
| Usage analytics and broken-link checks | Planned. |

The Ticket 1 vision proposes a link registry, a redirect/cache proxy, and a telemetry/link-health service. These are design goals; the repository does not yet implement that service architecture.

## Branches and repository structure

The repository uses `main` as its default branch and contains the frontend/backend scaffold there. The standalone HTML prototype is on `feat/app-shell-and-search`. Select the appropriate branch before following setup instructions.

| Branch | Purpose | Key paths |
| --- | --- | --- |
| [`main`](https://github.com/Sithabo/CS-3203-LinkStream/tree/main) | Default branch; frontend and backend application scaffold | [frontend/](frontend/), [backend/](backend/) |
| [`feat/app-shell-and-search`](https://github.com/Sithabo/CS-3203-LinkStream/tree/feat/app-shell-and-search) | Standalone HTML directory and search prototype | [index.html](https://github.com/Sithabo/CS-3203-LinkStream/blob/feat/app-shell-and-search/index.html) |

Application scaffold on `main`:

```text
frontend/
  app/                       Next.js pages, layout, and styles
  public/                    Static assets
  package.json               Frontend scripts and dependencies
backend/
  app/controllers/           Account and authentication endpoints
  app/models/                User model
  app/validators/            Signup and login validation
  config/                    Database, authentication, CORS, and app settings
  database/migrations/       Users and access-token tables
  start/routes.ts            HTTP route definitions
  tests/bootstrap.ts         Japa test setup
  .env.example               Local environment template
  package.json               Backend scripts and dependencies
```

## Technology stack

| Area | Technologies |
| --- | --- |
| Standalone prototype | HTML, CSS, vanilla JavaScript |
| Application frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Application backend | AdonisJS 7, TypeScript, Lucid ORM, VineJS validation |
| Local database | SQLite through `better-sqlite3` |
| Development tools | Git/GitHub, npm, ESLint; Prettier and Japa in the backend |

## Installation and setup

Repository access is required to clone this private project. Choose either the prototype or the application scaffold below.

### Option A: Standalone search prototype

**Requirements:** Git and a modern web browser. Node.js, package installation, and a database are not needed.

```bash
git clone --branch feat/app-shell-and-search https://github.com/Sithabo/CS-3203-LinkStream.git
cd CS-3203-LinkStream
```

Open `index.html` directly in your browser. The HTML file includes its own styles, sample cards, and search logic.

### Option B: Frontend and backend scaffold

**Requirements:** Git, Node.js 24 or newer, and npm. The backend's AdonisJS packages require Node.js 24+. SQLite is configured locally; no separate database server is needed.

For a fresh checkout:

```bash
git clone --branch main https://github.com/Sithabo/CS-3203-LinkStream.git
cd CS-3203-LinkStream
```

If you already cloned the prototype, use `git switch main` in that checkout instead of cloning into the same directory again.

In one terminal, install and start the backend. The environment-copy and key-generation steps below are for first setup; keep your existing `.env` and key when returning to an established checkout.

```bash
cd backend
npm ci
cp .env.example .env
node ace generate:key
node ace migration:run
npm run dev
```

The [.env.example](backend/.env.example) file uses `HOST=localhost`, `PORT=3333`, and `APP_URL=http://${HOST}:${PORT}`. Generate a local `APP_KEY` with the command above. Keep `.env` and access tokens out of commits. The database is stored at `backend/tmp/db.sqlite3`.

In a second terminal, starting from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the frontend and [http://localhost:3333](http://localhost:3333) for the backend. The frontend currently shows the Next.js starter page, and the backend root returns `{"hello":"world"}`. The LinkStream prototype has not yet been integrated with this scaffold.

## Usage

### Try the search prototype

1. Open `index.html` from `feat/app-shell-and-search`.
2. Locate the **Implementation Plan** (`go/implementation`) and **Weekly Standup Meeting** (`go/standup`) cards.
3. Type `implementation` to show the implementation card, or `standup` to show the meeting card.
4. Try `DISCORD` to match the meeting card without regard to letter case.
5. Clear the search using the keyboard to show both cards again.

A query with no matches hides both cards; there is no separate empty-state message yet. Card aliases and destination paths are sample text, not clickable links. The displayed implementation-plan file and Discord address are illustrative sample data.

### Account API scaffold

The routes below are defined in [backend/start/routes.ts](backend/start/routes.ts) under `/api/v1`:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/signup` | Create an account and issue an access token. |
| `POST` | `/api/v1/auth/login` | Authenticate and issue an access token. |
| `GET` | `/api/v1/account/profile` | Read the authenticated user's profile. |
| `POST` | `/api/v1/account/logout` | Revoke the current access token. |

Signup accepts `fullName` (nullable), `email`, `password`, and matching `passwordConfirmation`. Passwords must be 8–32 characters. Login accepts `email` and `password`. Protected endpoints use `Authorization: Bearer <access-token>`. These endpoints provide the account foundation; no link-management or shortcut-redirect endpoints are implemented yet.

## Roadmap

The next development priorities are to:

- Build the shared link catalog in the Next.js frontend and connect it to the backend.
- Add persistent shortcut creation, editing, and deletion, with validation for names and destination URLs.
- Implement shortcut lookup and redirection, and document how teammates enable `go/` navigation in their browsers.
- Add automated tests for account and shortcut flows, then run the relevant checks on pull requests.

Later goals from the Ticket 1 vision include tags and ownership, team namespaces and roles, usage analytics, and broken-link detection. These are planned capabilities with no release dates committed yet.

## Validation

For the prototype, manually check that both cards appear initially, keyword and uppercase searches select the expected card, an unmatched query hides both cards, and clearing the query with the keyboard restores both cards.

For the scaffold on `main`, after installing dependencies and configuring the backend environment, the repository provides these commands:

```bash
# From frontend/
npm run lint
npm run build
```

```bash
# From backend/
npm run lint
npm run typecheck
npm test
npm run build
```

The backend has Japa configuration but no unit or functional test cases checked in yet. The frontend has no test script. No GitHub Actions workflow is currently checked in. The commands above describe available checks, not a claim of passing tests or completed CI coverage.

## Support

For setup questions, bugs, or feature suggestions, use the [GitHub issue tracker](https://github.com/Sithabo/CS-3203-LinkStream/issues). Include the branch, steps to reproduce the issue, expected and actual behavior, and relevant error messages. Remove passwords, access tokens, and other secrets from logs before posting them. Repository access is required.

Group A maintains the project. Team members are listed below; course-specific instructions remain in the linked Canvas assignment.

## Contributing and code management

Group A teammates can contribute through issues and pull requests. Agree on the scope with the team before starting a larger feature.

For application work, branch from `main`; for changes to the existing HTML prototype, branch from `feat/app-shell-and-search`. Keep pull requests focused on one change and target the branch containing the code being changed.

1. Fetch the latest changes and update your chosen base branch.
2. Create a descriptive branch such as `feat/link-catalog`, `fix/search-filter`, or `docs/readme`.
3. Make a scoped change, run the relevant checks, and review the diff.
4. Commit with a short, descriptive message, then push your branch.
5. Open a pull request that explains the change and its validation, and request a teammate's review.
6. Resolve feedback and conflicts before merging. Use squash merging when several intermediate commits represent one completed change; coordinate before rebasing a branch shared with teammates.

For Ticket 3, retain the real pull-request and commit history needed to explain branching, squashing, rebasing, and merging. This README documents the project; any separate evidence or submission requested by the assignment must be prepared from the team's actual work.

## Team

**Developed and maintained by Group A — CS 3203, Fall 2026**

- Sithabiso Hlanze
- Isaiah Bergstrom
- Thandeka Madonsela
- Hanatou Yahaya Idi
- Lana Johnson

Team membership is taken from the group's Ticket 1 product vision. [GoLinks](https://www.ycombinator.com/companies/golinks) is the reference product for the internal-shortcut concept.

## Course references

- [Project repository](https://github.com/Sithabo/CS-3203-LinkStream)
- [Ticket 3: Code Management](https://canvas.ou.edu/courses/492287/assignments/3591494) — assignment instructions and linked README guidance; OU Canvas access required.
- [Ticket 1 product vision in repository history](https://github.com/Sithabo/CS-3203-LinkStream/blob/c2b27c7/GroupA_Ticket1ProductVision_CS3203Fall2026%20-%20Google%20Docs.pdf) — original product direction and team roster. The PDF is no longer in the current branch.

## License

No repository-wide `LICENSE` file is currently included. The backend package metadata declares MIT, but a project-wide license has not been documented. Confirm the team's intended licensing before reusing or distributing the project.
