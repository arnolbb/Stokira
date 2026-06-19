# Repository Guidelines

## Project Structure

```
index.html              # SPA entry point (loads app.js + styles.css)
app.js                  # Frontend: views, routing, state, DOM rendering
styles.css              # Styles, CSS custom properties, responsive breakpoints
backend/
  server.js             # Express server (static files + REST API on :3001)
  services/
    stock-service.js    # Business logic (validation, stock mutations)
  repositories/
    local-store.js      # JSON file data layer (swap target for Supabase)
  seed.js               # Initial seed data
data/
  stokira-db.json       # Runtime database (gitignored, auto-created from seed)
PRD.md                  # Product requirements
PRODUCT.md              # Design context for UI tooling
BACKEND.md              # API reference and usage examples
```

## Build, Test, and Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start backend on `http://127.0.0.1:3001` (also serves frontend) |
| `npm run check` | Syntax-check all backend JS files via `node --check` |
| `node --check app.js` | Syntax-check the frontend |

No build step. Frontend is plain HTML/CSS/JS. Backend uses only Node built-ins — no `npm install` required.

## Coding Style

- **Indentation**: 2 spaces, no tabs.
- **Strings**: Double quotes in JS. Single quotes only inside SVG/HTML template literals.
- **CSS tokens**: Use `var(--*)` custom properties. Never hard-code colors outside `:root`.
- **Naming**: `camelCase` for JS, `kebab-case` for CSS classes and routes, `UPPER_CASE` for constants.
- **No formatter or linter is configured.** Match existing patterns; keep diffs minimal.

## Architecture Notes

- **Frontend** uses hash-based routing with full `innerHTML` re-render. State lives in `localStorage` under key `stokira.local.v1`.
- **Backend** follows a repository/service split. `stock-service.js` holds business rules; `local-store.js` is the only file that touches `data/stokira-db.json`. To migrate to Supabase, replace the repository only.
- **Stock integrity**: Stock is never edited directly. All changes go through stock-in, stock-out, or adjustment flows and produce a `movement` audit record.

## Commit Guidelines

- Keep commits atomic: one logical change per commit.
- Prefix with area when useful: `frontend:`, `backend:`, `docs:`.
- Verify `npm run check` and `node --check app.js` pass before committing.

## Agent Instructions

- Run `node --check app.js` after editing frontend; `npm run check` after editing backend.
- Do not add `node_modules`, `data/*.json`, `*.log`, or `*.pid` to version control.
- Preserve the repository/service boundary in `backend/`. Never import `local-store.js` from `server.js` — route through `stock-service.js`.
- CSS contrast must meet WCAG AA (≥4.5:1 for body text). Verify when changing color tokens.