# Pequeñas Finanzas — World Visual v6 control

## Purpose

This control turns the visual research into an implementation gate for the **whole game**, not only the seven minigames.

## Training / production references used

- Grafit Studio — UI Design for Games: reusable blocks, adaptivity, HUD/windows/props, developer-ready export.
- Nima Tahami — The Complete Figma Course: components, styles, constraints, responsive layouts and real-device validation.
- Mobile App Design in Figma: design system, wireframes, reusable screen grammar before decoration.
- PedroTech — React Native Full Course / Expo: one Expo Router app, reusable components wired to real state.
- Coco Code — Master Unity UI: reference canvas, anchors, scaling, overlays, currency HUD and level-selection patterns.
- Riot Games ArtEDU — UI Design: show information when it is needed and keep gameplay dominant.
- Supercell UI production guidance: one visual language, responsive polish, motion feedback and reusable components.
- Ubisoft UI Technical Artist guidance: decompose mockups into widgets and logic; optimize memory/textures/assets.

URLs and application notes live in `docs/research/COURSE_IMPLEMENTATION_V6.md`.

## Implementation gates

1. One application/router; no visual sub-app fork.
2. Reference composition 1672×941 with one uniform scale; extra aspect ratio reveals more world.
3. Safe-area anchored navigation/HUD.
4. `expo-image` cover + downscaling + memory/disk caching for scenic images.
5. Mockups containing text/buttons/prices/progress are reference-only, never runtime screens.
6. ThemePack exposes semantic world/art roles; feature code does not require thematic files directly.
7. Entry, onboarding, map, camp, wallet, investments, shop, progress, collection, Arcade, adults, settings, lessons and game route all participate in the shared presentation contract.
8. Coin Catcher converts physical drag input into logical-canvas coordinates.
9. Coin Catcher accepted collision/timing constants remain unchanged.
10. Seven game IDs, campaign order, Arcade 7/7, Theme/SSOT and investment N+4/+50% remain unchanged.
11. New v6 runtime art slice stays under the explicit budget gate.
12. Final aesthetic PASS still requires screenshots from the actual target device; static implementation PASS is not a substitute for visual proof.
