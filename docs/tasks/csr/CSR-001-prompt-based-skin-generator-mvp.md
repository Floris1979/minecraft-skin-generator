# CSR-001 — Prompt-based Minecraft skin generator (MVP)

**Date:** 2026-10-19
**Status:** Accepted (see `decisions/DECISIONS.md`, 2026-10-19)

## Summary

Build the first working version of the minecraft-skin-generator: a web app where a user
types a text prompt describing a character and gets back a valid 64x64 Minecraft player
skin texture, with a live 3D preview and a PNG download.

## Motivation

This is the first feature for a brand-new project. We need an end-to-end walking
skeleton — prompt in, skin out — before investing in better generation quality, more
skin parts, or accounts/sharing.

## Scope

**In scope**

- Single-page web app, no login/accounts.
- Text input for a free-form prompt (e.g. "a knight in blue armor with a red cape").
- Procedural / rule-based generation: parse keywords from the prompt (colors, simple
  themes like "knight", "robot", "wizard", "zombie", etc.) and map them to regions of
  the standard 64x64 Minecraft skin template (head, torso, arms, legs) using layout and
  color rules — no image-generation model or external AI API involved.
- Output a valid 64x64 PNG skin file (modern format, with second-layer "overlay"
  regions left blank for MVP).
- Live 3D preview of the generated skin, rotatable, rendered client-side.
- Download button for the generated PNG.
- Runs entirely client-side (static site) — no backend required for MVP, since
  generation is procedural and happens in the browser.

**Out of scope (future CSRs)**

- AI/image-model-based generation (upgrading from rule-based to a trained/generative
  approach).
- Second-layer ("overlay") detail generation (hats, jackets, sleeves).
- Accounts, saving/sharing generated skins, galleries.
- Direct upload to a Minecraft account or skin hosting service.
- Mobile app / non-web clients.

## Proposed approach

- **Frontend:** static web app (plain HTML/CSS/JS or a lightweight framework — exact
  stack to be confirmed in the HLD) with:
  - A `<canvas>`-based skin template renderer/editor that draws the 64x64 texture.
  - A prompt → attributes parser (keyword/color matching, no ML).
  - An attributes → pixel-region mapper that paints the skin template.
  - A 3D preview pane using an existing browser skin-rendering library (e.g.
    `skinview3d`) rather than building a custom 3D renderer.
- **Backend:** none for MVP; everything runs in-browser so the app can be hosted as a
  static site.
- **Data:** no persistence in MVP; the generated skin exists only in the current
  browser session until downloaded.

## Open questions

- ~~Exact list of recognized prompt keywords/themes for the MVP rule set, and how
  unrecognized prompts should fall back~~ — resolved: 14 themes (knight, robot,
  wizard, zombie, pirate, ninja, skeleton, alien, astronaut, vampire, witch, cowboy,
  soldier, villager, plus a generic `adventurer` fallback) and a visible "didn't
  recognize everything" note on fallback. See `decisions/DECISIONS.md`, 2026-10-19.
- Known limitation, not resolved here: the color-to-body-part heuristic is
  position-based (first color mentioned -> primary, second -> secondary), not
  context-aware, so prompts like "gold trim and a brown coat" can map the accent
  color to the primary body part. Left as-is for MVP; revisit if prompt coverage
  needs to improve further.
- Specific frontend stack/framework choice (plain JS vs. a framework) — to be settled
  in the HLD.
- ~~Hosting target for the static site.~~ — resolved: GitHub Pages, deployed via a
  GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that publishes
  `web/` on every push to `main`. See `decisions/DECISIONS.md`, 2026-10-19.

## Risks

- Rule-based generation from free text is inherently limited — prompts outside the
  recognized keyword set will produce generic or unexpected results. This is accepted
  for the MVP and flagged as the main motivation for a future AI-generation CSR.

## Acceptance criteria

- A user can type a prompt, click generate, and see a 3D-rendered preview of a skin
  that reflects at least the colors/theme keywords recognized in the prompt.
- The downloaded PNG is a valid 64x64 Minecraft skin file that renders correctly
  in-game / in third-party skin viewers.
