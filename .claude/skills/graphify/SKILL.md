---
name: graphify
description: >
  Build or refresh the queryable code graph at .claude/graph/ so sessions answer
  "where is X / what uses Y" from the graph instead of re-reading source files.
  Trigger on /graphify, "build the code graph", "refresh the graph",
  "graphify the project". This is an ON-DEMAND, token-costing rebuild — NEVER
  auto-run it at session start (read the existing graph as-is instead). Build
  only when the graph is missing and a heavy code task needs it, on explicit
  request, or at END of a session that changed structure.
---

# Graphify — queryable code graph

Generates a compact, structured map of the codebase under `.claude/graph/`
(relative to the current project root). The goal: a session should resolve
"where does X live", "which services call endpoint Y", "what routes exist"
from these files — without re-grepping `src/` every time.

The graph is **derived data**. Never hand-edit it; re-run the skill instead.
It should be gitignored (ephemeral per-clone, like session handoffs). If the
project's `.gitignore` doesn't cover `.claude/graph/`, add it.

## Output layout

```
.claude/graph/
├── meta.md          # generation timestamp, git commit, file counts
├── INDEX.md         # top-level map + how to query the other files
├── routes.md        # routing flattened: path → component/handler file
├── features.md      # one section per feature area: purpose,
│                    #   key components/services w/ file paths + line refs
├── api.md           # API client classes → backend endpoints they wrap
└── shared.md        # shared components/services/utils + core infrastructure
```

Add project-specific sections when they earn their keep (e.g. `apps.md` for
an app-store registry). Link every extra file from `INDEX.md`.

## Workflow

### Step 1 — decide full build vs refresh

```bash
cat ".claude/graph/meta.md" 2>/dev/null
```

- **No meta.md** → full build (step 2).
- **meta.md exists** → read its `commit:` line, then:

```bash
git diff --name-only <lastCommit>..HEAD -- src | sort -u
git status --short -- src
```

Only re-scan the feature areas that own changed files; leave other graph
sections untouched. If more than ~40% of features changed, do a full build.

### Step 2 — scan

Sources of truth (read these, don't guess). For Angular projects (org
standard):

| Graph file | Derive from |
|---|---|
| `routes.md` | `src/app/app.routes.ts` (or the project's root routing file) |
| `features.md` | `src/app/features/*/` directory listing + each feature's main component/service headers |
| `api.md` | every `*-api.service.ts` / `*ApiService` class — record `basePath` + method → endpoint pairs |
| `shared.md` | `src/app/shared/`, `src/app/core/`, `src/app/layout/` |

For non-Angular projects, derive the equivalent entry points (routing config,
controllers, modules) and keep the same file layout.

Per entry record: **name · one-line purpose · file path (+ line for key
symbols)**. No code bodies. No speculation — one-line purposes come from the
file's own doc comment when present, otherwise from reading the class briefly.

### Step 3 — write

Write the files under `.claude/graph/`. Keep each file under ~400 lines;
if a section outgrows that, split by sub-area and link from `INDEX.md`.

`meta.md` format:

```markdown
---
generated: <ISO timestamp>
commit: <git rev-parse HEAD>
files-scanned: <count>
mode: full | refresh
---
```

### Step 4 — confirm

Report to the user: mode (full/refresh), areas rescanned, total entries,
anything that looked structurally surprising (e.g. a new feature area with
no route). One short paragraph.

## Querying the graph (for sessions)

When a task starts and `.claude/graph/INDEX.md` exists: **read the graph files
first** for orientation, and fall back to Grep/Read only for the specific code
you're about to change. Read the graph **as-is even if stale** — a stale graph
is still a useful map; just verify the specific path/symbol you act on. Do not
rebuild merely because it's a few commits behind.

## When NOT to rebuild (keep session start fast)

A rebuild costs tokens; reading the graph is nearly free. So:

- **Session start / quick tasks → never rebuild.** Use the existing graph,
  stale or not. Just starting a session to "do a thing" must not trigger a scan.
- **Rebuild only when:** the graph is missing and a heavy code-navigation task
  needs it; OR the user runs `/graphify` explicitly; OR you hit a concrete
  wrong pointer mid-task on a heavy job (refresh just that area); OR
  end-of-session cleanup after structural changes.
- Never rebuild "just in case" or on a fixed commit-count timer.

## End-of-session refresh

Before `/handoff` (or when the user says they're wrapping up), re-run with
refresh mode so the next session inherits an up-to-date graph.
