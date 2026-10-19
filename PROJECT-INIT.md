# Project initialisation flow

Profile: **AI project — org standard (CSR → HLD → decisions)** (`org-standard`).

Whoever opens this project — Claude Code or Codex — follows this flow before
writing code. It is guided-with-record: you are not hard-blocked, but a skipped
step is logged in `decisions/DECISIONS.md` so the record is honest.

1. Create a **CSR** (change set request) in `docs/tasks/csr/` describing what will change.
2. Validate it against the **HLD** (`docs/hld/HLD.md`); amend the HLD if the change requires it.
3. Append the **decision** and its *why* to `decisions/DECISIONS.md` (append-only).

Structure scaffolded for you: `docs/tasks/csr/` (change set requests),
`docs/hld/HLD.md` (high-level design), `decisions/DECISIONS.md` (append-only log).
