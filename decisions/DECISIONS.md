# Decisions

> Append-only. One decision per entry, newest at the bottom. Never edit or delete a past
> entry — supersede it with a new one that references it.

<!-- Format:
## YYYY-MM-DD — <short title>
**Decision:** …
**Why:** …
-->

## 2026-10-19 — MVP is a client-side, rule-based skin generator (CSR-001)

**Decision:** Build the first version of the skin generator as a static, client-side
web app with no backend. Skins are produced from a text prompt using a rule-based
keyword/color parser, not an AI/image-generation model. Output is a 64x64 base-layer
skin PNG with a live 3D preview (via an existing browser skin-rendering library) and a
download button. HLD created at `docs/hld/HLD.md` to record this architecture.

**Why:** This is a brand-new project; the goal is an end-to-end working app
(prompt -> skin -> preview -> download) before investing in generation quality,
overlay layers, accounts, or a backend. Rule-based generation and a backend-free
architecture are both the fastest path to that walking skeleton. AI-based generation
is deferred to a future CSR; the HLD's prompt-parser stage is the intended seam for
that later swap.

## 2026-10-19 — Broadened MVP theme keyword coverage (CSR-001 open question)

**Decision:** Added six themes to `THEMES` in `web/app.js` — astronaut, vampire,
witch, cowboy, soldier, villager — on top of the original eight (knight, robot,
wizard, zombie, pirate, ninja, skeleton, alien) plus the generic `adventurer`
fallback. Verified all 14 themes resolve to the correct palette and the
"didn't recognize everything" fallback note no longer fires for these prompts.
Left the position-based color-to-body-part heuristic (first color mentioned wins
primary) unchanged — it can still produce semantically-reversed results for prompts
like "gold trim and a brown coat" — this is tracked as a known limitation in
CSR-001, not fixed by this change.

**Why:** Closes the "exact list of recognized keywords" open question from CSR-001.
A prior test pass (5 extra prompts) found "astronaut" had no matching theme and fell
back to the generic default, which was flagged as a coverage gap worth deciding on
before shipping; the user chose to broaden the keyword list (over leaving it as-is).

## 2026-10-19 — Hosting target: GitHub Pages via Actions (CSR-001 open question)

**Decision:** Host the static site on GitHub Pages, deployed by a GitHub Actions
workflow (`.github/workflows/deploy-pages.yml`) that publishes the `web/` directory
on every push to `main` (via `actions/upload-pages-artifact` + `actions/deploy-pages`,
no build step). Added a `.gitignore`. Git/GitHub CLI are not installed on this
machine, so repo init, the GitHub remote, and the first push are done manually by the
user, not by the assistant — the workflow file and `.gitignore` are prepped and
waiting in the working tree.

**Why:** Closes the "hosting target" open question from CSR-001. GitHub Pages fits
the no-backend, static-site architecture from the HLD at no cost. An
Actions-based deploy (rather than a `gh-pages` branch or serving from a `/docs`
folder) was chosen specifically because this repo's `docs/` directory is already
used for CSR/HLD/process documentation — an Actions artifact deploy avoids clashing
with that.
