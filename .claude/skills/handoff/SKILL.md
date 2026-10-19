---
name: handoff
description: >
  Produce structured session-handoff notes so a NEW session can continue the
  work without re-deriving context. Trigger on /handoff, "write a handoff",
  "prepare handoff notes", "wrap up for a new session". Run BEFORE a second
  context compression hits (roughly 600-700k tokens on the 1M model), or sooner
  when the session starts re-deriving things it already knew. Pairs with
  /resume.
---

# Handoff — structured session notes

Writes a single handoff file that a fresh session reads via `/resume` to
pick up exactly where this one left off. The handoff is the *delta* the next
session can't get from the repo itself: in-flight state, decisions, open loops.
Anything derivable from git/code/docs stays OUT (the graph + repo carry that).

## Output

`.claude/handoffs/YYYY-MM-DD-HHmm-<slug>.md` (relative to the project root)
— and update `.claude/handoffs/status.md` to point at it (one-line pointer +
date). Handoffs should be gitignored (ephemeral per-task docs); add a
`.gitignore` entry if the project lacks one.

The path stays `.claude/handoffs/` whichever agent is running. It is where this
convention has always written, so a session of either kind resumes on the same
evidence rather than starting from nothing.

## Before writing — gather real state (don't trust memory of it)

```bash
git -C "<active worktree>" status --short
git -C "<active worktree>" log --oneline -8
git -C "<repo root>" worktree list
```

If the project has a task inbox (e.g. `docs/tasks/inbox/`), also:

```bash
ls -t "docs/tasks/inbox/" | head -8
```

Also refresh the code graph if it exists (`/graphify` refresh mode) so the
next session inherits an accurate map.

## Handoff file structure

```markdown
---
created: <ISO timestamp>
session-topic: <one line>
active-worktree: <path + branch>
---

# Where things stand

## Shipped this session
- <commit/merge list with hashes + one-line purpose — copy from git log>

## In flight (not finished)
- <feature/fix> — <exact state: what's done, what's missing, which files>

## Waiting on
- <external tasks filed + their paths, with what unblocks when they land>

## Decisions made (and why)
- <decision> — <reason>  ← only non-obvious ones a new session might re-litigate

## Gotchas discovered
- <thing that cost time this session — e.g. wrong DTO field names, port conflicts>

## Next steps, prioritized
1. <most important next action, concrete enough to start cold>
2. …

## Key locations
- <file paths + line refs the next session will need immediately>
```

## Rules

- **Verify before writing.** Every commit hash, file path, and inbox filename
  in the handoff must come from a command you just ran, not recall.
- **Keep it under ~150 lines.** A handoff that needs scrolling defeats itself.
- **One handoff per wrap-up.** Don't append to old handoff files; write a new
  one and repoint `status.md`.
- After writing, tell the user: handoff path + "start a new session and run
  /resume to continue".
