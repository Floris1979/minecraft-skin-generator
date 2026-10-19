# High-Level Design — minecraft-skin-generator

**Status:** Living document. Last updated 2026-10-19 (CSR-001).

## Purpose

A tool that generates Minecraft player skins from a text prompt, with a live preview
and download.

## Architecture (as of CSR-001)

Static, client-side web app. No backend, no persistence, no accounts.

```
[ Prompt input ] -> [ Prompt parser (keywords/colors) ] -> [ Attribute set ]
                                                                   |
                                                                   v
                                           [ Skin template painter (canvas) ]
                                                                   |
                                                    +--------------+--------------+
                                                    v                             v
                                       [ 3D preview (skinview3d) ]    [ PNG export / download ]
```

- **Prompt parser:** rule-based keyword/color matcher. No ML/AI model involved (see
  CSR-001 scope). Unrecognized input falls back to a default/generic skin.
- **Skin template painter:** draws onto the standard 64x64 Minecraft skin UV layout
  (head/torso/arms/legs, base layer only for MVP; overlay layer deferred).
- **3D preview:** rendered client-side via an existing library rather than a custom
  renderer.
- **Export:** canvas → PNG, user-downloadable. Valid 64x64 Minecraft skin format.

## Key decisions

- No backend for MVP — generation is cheap/local enough to run entirely in the
  browser, which also simplifies hosting to a static site. Revisit if/when generation
  moves to an AI model that needs server-side compute (future CSR).
- Generation is procedural/rule-based rather than AI-model-based for the first
  version, to get an end-to-end working app quickly. AI-based generation is an
  explicit future CSR, not a rewrite of this architecture — the parser stage is the
  seam where that swap would happen.
- Overlay (second) layer of the skin is out of scope until base-layer generation
  works end-to-end.

## Open items

- Frontend stack (plain JS vs. framework) and hosting target: to be decided during
  CSR-001 implementation and recorded in `decisions/DECISIONS.md`.
- Rule set for prompt keywords/themes: to be defined during CSR-001 implementation.

## Change log

- 2026-10-19 — CSR-001: initial architecture (prompt-based MVP, client-side,
  rule-based generation).
