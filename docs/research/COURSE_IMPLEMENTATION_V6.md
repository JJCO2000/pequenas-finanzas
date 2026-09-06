# Pequeñas Finanzas — Visual implementation contract v6

This document records the training/references used to make the visual implementation decisions.
The project does **not** copy another game's interface or art. The sources are used to extract reusable
production principles and then implement them in Expo / React Native.

## A. Three full design courses reviewed

1. **Grafit Studio — UI Design for Games**  
   https://www.udemy.com/course/game-ui-design/  
   Applied here: reference board -> prototype -> reusable blocks -> adaptivity -> HUD/icons/windows/props -> developer-ready export.

2. **Nima Tahami — The Complete Figma Course: Designing Mobile & Web App UI/UX**  
   https://www.udemy.com/course/the-complete-figma-course/  
   Applied here: reusable components/styles, constraints, responsive layouts, realistic prototypes and real-device validation.

3. **Mobile App Design in Figma: From Concept to Prototype**  
   https://www.udemy.com/course/mobile-app-design-in-figma-from-concept-to-prototype/  
   Applied here: moodboard, design system, project structure, wireframes and reusable screen grammar before polishing individual screens.

## B. Three long-form YouTube implementations reviewed

4. **PedroTech — React Native Full Course (Expo)**  
   https://www.youtube.com/watch?v=J50gwzwLvAk  
   Applied here: keep the existing Expo Router application; add reusable components/features instead of creating a second app; wire UI to real state.

5. **PedroTech — Complete React Native Beginner Course using Expo (2026)**  
   https://www.youtube.com/watch?v=RdJhqaOIWn0  
   Applied here: Expo Router screens, development builds, reusable React Native components and real project structure.

6. **Coco Code — Master Unity UI (free masterclass / full-course preview)**  
   https://www.youtube.com/watch?v=Unnd0cOSiLU  
   Applied here as engine-independent game-UI practice: anchors, scaling, canvas reference, overlays, virtual currency HUDs, level selection and show/hide UI.

## C. Three game-company production references reviewed

7. **Riot Games — User Interface Design / ArtEDU**  
   https://www.riotgames.com/es/artedu/user-interface-design  
   Applied here: show mission/stats/inventory information when needed; avoid persistent UI that competes with gameplay.

8. **Supercell — Senior UI Artist role / Clash Royale**  
   https://supercell.com/en/careers/senior-ui-artist/66476c5d-30b6-4772-aa41-94d251e3d73c/  
   Applied here: polished responsive UI, close artist/developer integration, motion feedback, reusable components and one consistent visual language.

9. **Ubisoft Montréal — UI Technical Artist**  
   https://montreal.ubisoft.com/en/jobs/ui-technical-artist-march-of-giants/  
   Applied here: decompose mockups into reusable widgets + logic flows; optimize CPU, memory and textures; never ship a flattened mockup as the interactive screen.

## Technical cross-checks

- Expo Image: https://docs.expo.dev/versions/latest/sdk/image/
- Expo safe areas: https://docs.expo.dev/develop/user-interface/safe-areas/
- Unity Canvas Scaler: https://docs.unity3d.com/es/530/Manual/script-CanvasScaler.html
- Godot multiple resolutions: https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html

## Non-negotiable implementation rules

1. **One existing application.** No second app/sub-app/router. The new work is a presentation layer inside the existing feature architecture.
2. **World first, UI second.** Gameplay and adventure screens expose the scene first; HUD/panels are overlays or localized surfaces.
3. **Mockups are visual masters, never runtime screenshots.** Any image with text, prices, progress, locks, buttons or state is reference-only.
4. **Three runtime layers:** environment background -> art/characters/props -> React Native state/UI.
5. **Semantic assets through ThemePack.** Feature code does not `require()` thematic files directly.
6. **Uniform reference scaling.** Reference = 1672x941. `scale = min(screenW/1672, screenH/941)`. Extra aspect-ratio space reveals more world.
7. **Safe-area anchored controls.** Back/help/HUD must remain reachable without relying on master-image coordinates.
8. **No silent mechanic changes during visual work.** Collision sizes, rewards, economy, progression and game contracts remain unchanged unless separately approved.
9. **Reusable UI kit.** Headers, panels, stats, buttons and scene framing are shared components; screens compose them instead of cloning styles.
10. **Runtime asset budget is enforced.** Only referenced, interaction-safe assets stay under `assets/`; rejected visual masters live under `design/reference/`.
11. **Device screenshots are the final visual proof.** Static code audits can pass implementation structure, but not final aesthetic fidelity.

## Current decision

The current implementation slice now covers the **world presentation foundation + entry/onboarding + adventure map + Camp + wallet/investments/shop + progress/collection/Arcade + adults/settings + lessons + game route**, while Coin Catcher keeps its approved mechanics and uses logical-canvas input conversion.

This follows the common pattern across the reviewed material: design the reusable system first, decompose visual masters into real widgets/state, then validate the whole navigation surface before polishing additional art.
