<!-- director:rules:start -->
<!-- Written by Director from .director/ruleset.md. Edits inside this block are replaced; edit the ruleset instead. Everything outside it is yours. -->

## Where things live

| Path | What goes there |
|---|---|
| `docs/tasks/inbox/` | Work arriving from elsewhere |
| `docs/tasks/csr/` | Change set requests — the analysis before the code |
| `docs/features/` | What this project does |
| `docs/processes/` | How the team works on it |
| `docs/hld/HLD.md` | High-level design |
| `decisions/DECISIONS.md` | Decisions and their why, append-only |
| `.director/ruleset.md` | The rules this project is held to |
<!-- director:rules:end -->

## Running the app

Static site, no build step or backend (see `docs/hld/HLD.md`). Serve `web/` with any
static file server and open it, e.g.:

```sh
npx serve web
```
