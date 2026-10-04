# Sprint 1 — LinkStream data payloads and JSON schemas

**Linear:** CS-23 — Draft data payloads & JSON schemas  
**Scope:** Sprint 1 / Foundation & API Design  
**Schema dialect:** JSON Schema Draft 2020-12

This artifact defines reusable JSON payload shapes for LinkStream's shortcut resource. It is intentionally **transport-neutral**: CS-22 owns HTTP methods and paths. These schemas are designed to plug into create, update, read, list, and search endpoints without prescribing the route layout.

## Canonical shortcut resource

A shortcut carries the product information already present in the LinkStream vision:

- a memorable `go/...` alias;
- a target destination URL;
- human context (`title`, optional `description`, `tags`);
- ownership and team/namespace scope;
- usage (`clickCount`);
- asynchronous destination health;
- stable identity and timestamps.

The source of truth is `linkstream-api.schema.json` under `$defs.Shortcut`.

## Required vs optional / nullable fields

### Server resource

The returned `Shortcut` object is structurally complete: every top-level field is present.

- `description` may be `null`.
- `health` may be `null` before the first link-health check.
- `health.statusCode` and `health.checkedAt` may be `null` while health is unknown.
- `clickCount`, `id`, `ownerId`, `teamId`, `createdAt`, and `updatedAt` are server-managed/read-only from the client perspective.

### Create request

Required:

- `alias`
- `targetUrl`
- `title`

Optional:

- `description` (defaults conceptually to `null`)
- `tags` (defaults conceptually to `[]`)

Ownership/team scope should come from authenticated request context rather than accepting arbitrary client-supplied `ownerId`/`teamId`.

### Update request

All editable fields are optional, but the object must contain **at least one** property. Server-managed fields cannot be updated through this payload.

## Validation assumptions

- Aliases use lowercase kebab-case after `go/`, e.g. `go/sprint` or `go/api-docs`.
- Alias uniqueness should be enforced **within a team/namespace**, not globally.
- Destination URLs must be absolute URIs.
- Tags use lowercase kebab-case and are unique within one shortcut.
- `clickCount` is a non-negative integer.
- Health is asynchronous and therefore nullable until measured.
- Unknown client properties are rejected (`additionalProperties: false`) to prevent silent contract drift.
- Identifier storage/auth implementation remains opaque: `ownerId` and `teamId` are strings so this contract does not couple itself to a specific auth schema.

## Compatibility with CS-22 endpoint work

These reusable schema names are intended to map onto whichever routes CS-22 finalizes:

| Endpoint responsibility | Schema |
| --- | --- |
| Create shortcut request | `CreateShortcutRequest` |
| Update shortcut request | `UpdateShortcutRequest` |
| Read one shortcut | `ShortcutResponse` |
| List shortcuts | `ShortcutListResponse` |
| Search shortcuts | `ShortcutSearchResponse` |
| Shared returned object | `Shortcut` |

If CS-22 chooses a different envelope convention (for example a bare object instead of `{ "data": ... }`), change only the response wrappers; keep `Shortcut`, create, and update shapes stable unless the team explicitly changes the resource model.

## Explicit open decisions for team sign-off

1. **Alias representation:** this draft serializes the canonical alias as `go/api-docs`. The router may internally use only the slug (`api-docs`), but API responses should choose one representation and use it consistently.
2. **Pagination style:** this draft uses `limit` + `offset`. If CS-22 chooses cursor pagination, replace only `$defs.Pagination` and the list/search wrappers.
3. **Health ownership:** health fields are modeled as part of the resource response but remain read-only to normal create/update clients.
4. **Analytics freshness:** `clickCount` is a read-only snapshot; the contract does not guarantee real-time consistency.
5. **Error envelope:** intentionally not defined here. CS-24 owns HTTP status/error semantics.

## Files

- `linkstream-api.schema.json` — executable schema bundle.
- `examples/create-shortcut.example.json` — valid create payload.
- `examples/update-shortcut.example.json` — valid partial update.
- `examples/shortcut-response.example.json` — valid single-resource response.
- `examples/list-shortcuts.example.json` — valid list response.
- `examples/search-shortcuts.example.json` — valid search response.

## Suggested README insertion

Add a short link under the repository's development/documentation section:

> API payloads and JSON schemas: [`docs/api/payloads-and-json-schemas.md`](docs/api/payloads-and-json-schemas.md)

That gives a cold reviewer a direct path from the README to the Sprint 1 API contract work.
