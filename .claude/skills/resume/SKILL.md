---
name: resume
description: >
  Resume work in a NEW session from the latest handoff notes. Trigger on
  /resume, "resume the session", "pick up where we left off", "continue from
  handoff". Reads .claude/handoffs/status.md → latest handoff, verifies it
  against actual git/inbox state, orients, and continues the top next-step.
  Pairs with /handoff.
---

# Resume — continue from handoff

Bootstraps a fresh session from the most recent `/handoff` notes,
*verifying* the recorded state instead of trusting it blindly (the repo may
have moved since the handoff was written).

## Workflow

### Step 1 — locate the handoff

```bash
cat ".claude/handoffs/status.md"
```

(Relative to the current project root.) Read the handoff file it points to.
If `status.md` is missing or points at nothing, say so and fall back to:
latest file in `.claude/handoffs/` by name, else ask the user what to work on.

### Step 2 — verify against reality

The handoff describes the world at write time. Re-check now:

```bash
git -C "<repo root>" worktree list
git -C "<handoff's active worktree>" status --short
git -C "<handoff's active worktree>" log --oneline -5
```

If the project has a task inbox (e.g. `docs/tasks/inbox/`), also:

```bash
ls -t "docs/tasks/inbox/" | head -8
```

Compare with the handoff's "Shipped" / "In flight" / "Waiting on" sections:

- New commits since the handoff → someone (or another session) worked here;
  read those commits before acting.
- New inbox files → an external party replied to something we were waiting
  on; read them FIRST (they may unblock or invalidate the planned next step).
- Uncommitted changes that the handoff doesn't mention → investigate before
  touching anything; could be the user's in-progress work.

### Step 3 — orient with the graph

If `.claude/graph/INDEX.md` exists, use it for code orientation instead of
re-grepping — **read it as-is, even if stale**. Do NOT rebuild the graph at
session start: starting a session must stay fast. A slightly stale graph is
fine for orientation; just verify a specific path/symbol before relying on it.
Only refresh mid-session if a heavy code task actually needs the graph and it
is clearly wrong, or on explicit `/graphify`. See graphify's "When NOT to
rebuild" rule.

### Step 4 — report + continue

Give the user a SHORT orientation (5-8 lines max):

- what the last session shipped,
- what's in flight,
- what changed since the handoff (new inbox files, new commits),
- the proposed next step.

Then start on the top next-step from the handoff (adjusted for anything new
from step 2) — unless the user redirects.

## Rules

- Never skip step 2. A stale handoff acted on blindly is worse than no
  handoff.
- If the handoff's next steps conflict with new inbox arrivals, surface the
  conflict and let the user pick.
