# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A 3D remake of Zork I built with Vite + React 19 + React Three Fiber (`three`, `@react-three/drei`, `@react-three/postprocessing`). ~74 rooms are implemented; the player moves room-to-room via a text terminal (typed verbs, direction buttons, WASD) while a fixed first-person 3D viewport renders the current room.

## Commands

```
npm install          # setup
npm run dev          # Vite dev server
npm run build        # production build (vendor chunking only applies here, not dev)
npm run preview      # serve the production build
npm run lint         # oxlint (config: .oxlintrc.json)
npm test             # vitest run — the full regression suite
npx vitest run src/state/__tests__/combat.test.js   # a single test file
```

Tests run in jsdom (configured in `vite.config.js`).

## The two documents that matter

- **`PROJECT_STATUS.md`** is the living reference: the full architectural decision log (§1), current room/item/verb state (§2), backlog (§3), ZIL source cross-references (§4), and past mistakes worth not repeating (§5). Read it before making non-trivial changes, and **update it when a decision or the room/item map changes meaningfully** — add a decision row rather than letting the "why" live only in a commit message. If it has drifted from the code, trust the code and fix the doc.
- This file covers only what you need to orient; PROJECT_STATUS.md carries the detail.

## The accuracy-first content policy (project's core rule)

Room text, verb responses, and mechanics must match the original Zork I where implemented — no invented content "in the spirit of" Zork. The canonical source is **Infocom's released ZIL source** at `historicalsource/zork1` on GitHub, not memory or walkthroughs. Fetch it fresh when needed:

```
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/1dungeon.zil   # rooms + objects
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/1actions.zil   # Zork I verb/room routines
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/gverbs.zil     # generic trilogy engine (scoring, V-WALK, V-SCORE...)
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/gmain.zil
```

If a routine "should obviously be somewhere" but isn't in the two Zork I files, look in `gverbs.zil`/`gmain.zil`. When a mechanic must be simplified (many are — combat odds, the thief, lamp timing), the *player-visible text* still comes verbatim from source, and the simplification gets documented in PROJECT_STATUS.md §2.6. This policy governs game-world content only, not UI tooling layered on top (the map and hint system are deliberate additions).

## Architecture

### One hook is the entire game engine

`src/state/useGameState.js` (~1900 lines) holds all game state — current room, inventory, flags, score/moves, health/deaths, lamp fuel, terminal log — and every verb handler (`moveRoom`, `interactWithObject`, `runCommand`). Components are thin renderers of that state; there is no scattered component state for game logic. `App.jsx` wires the hook into the three UI panels (`ViewportCanvas`, `TextTerminal`, `MapPanel`).

### Data layer: `src/gameData/`

- `rooms.js` — the room dictionary. Beyond `text`/`exits`, rooms use a small set of generic hooks rather than one-off special cases:
  - `text` may be a string **or** a function of `flags` (rooms whose description varies)
  - `exitGuards` — `(flags, inventory) => string | null | { flagUpdates }`: block a move with a message, allow it, or allow it *with* side effects
  - `blockedExits` — flavor-text dead ends (string or function of flags), distinct from "no exit at all" (which risks the grue in the dark)
  - `onEnter(flags)` — one-shot arrival effects, can return `{ message, flagUpdates, scoreBonus }`
  - `environment: 'surface' | 'underground'` — geography, separate from `dark` (lighting). A room can be underground *and* naturally lit (Gallery, Temples, Dam — `ONBIT` in source); the background-color logic checks both.
  - `cameraOffset` — optional per-room camera position (see below)
- `items.js` — item dictionary (`location`, `portable`, `floorText`, `description`, `readText`, treasure `value`/`tvalue`). Any item whose `location` equals the current room auto-appends its `floorText` to the room description.
- `combat.js` / `lamp.js` — verbatim source flavor text and thresholds. Combat message tables are `(defenderName) => string[]` template-fillers shared across villains.
- `mapLayout.js` — BFS-derived schematic coordinates for `MapPanel`, with spiral collision avoidance. The `rub mirror` teleport is fed in as an explicit extra edge (it has no `exits` entry).

Prefer extending these generic hooks over adding one-off special cases in the engine — nearly every past decision (see PROJECT_STATUS.md §1) went that way.

### Rendering: the "theater stage" model

The camera sits at the world origin, looking down -Z, and its rotation is set once and **never changes**. Each room is a self-contained stage built around that fixed viewpoint; switching rooms just mounts a different component (React's unmount does scene teardown — no manual `scene.remove()`/`dispose()`). Rooms may opt into a small `cameraOffset` that `CameraController.jsx` lerps toward (position only, capped step size so it never snaps).

- `ViewportCanvas.jsx` — the R3F `<Canvas>`, camera rig, lighting, fog, postprocessing (Bloom + Vignette), `<Sky>` for surface rooms
- `SceneManager.jsx` → `rooms/RoomRegistry.jsx` — plain object map from room id to component. **Adding a room = one entry in `rooms.js` + one component in `rooms/` + one registry entry.**
- `rooms/*.jsx` — one component per room (all 19 maze rooms share `MazeRoom`/`MazeDeadEnd` with a per-room seed)
- `primitives/` — shared pieces (`Ground` exports `GROUND_Y`/`EYE_HEIGHT`, `LanternLight`, `ObjectLabel` for drei `<Html>` hover labels — no 3D text geometry)
- `3d/VisualKit.jsx` — reusable parametric low-poly kit (`DungeonWall`, `ArchedDoorway`, `TreasureChest`); prefer these over inline geometry for stone/dungeon rooms

Lighting is a three-way split: truly dark (no light components at all), dark-but-lamp-lit (dim ambient + flickering `LanternLight`), and normal daylight. `isDark`/`isUnderground` are player-relative booleans derived from `room.dark` + lamp state.

### 3D placement rules (learned the hard way — PROJECT_STATUS.md §5)

The camera is horizontal and never tilts, so the frustum bites in non-obvious ways:

- Ground-level props closer than about `z = -3` fall entirely below the frame. Keep them at `z ≤ -3` unless they're tall enough to straddle the cutoff.
- A wall too close fills the *whole* screen and looks like "nothing rendered". For a room-spanning wall, keep `2 × |z| × tan(30°)` comfortably above the wall's height.
- The lantern has real inverse-square falloff — dark rooms need some geometry within ~2–4 units of the camera or they read as pitch black even when lit.
- `DungeonWall`'s default orientation is a *side* wall (thin along local X); a back wall needs `rotation={[0, Math.PI/2, 0]}`, not swapped size args.

## Testing conventions

The Vitest suite (`src/state/__tests__/`, `src/gameData/__tests__/`) drives the game exclusively through the public surface — `renderHook(useGameState)` + `runCommand`/`restoreGame` — never by mocking internals. `restoreGame`'s `localStorage` snapshot is the sanctioned "teleport" to reach distant rooms without walking the graph. `Math.random` is mocked deterministically; note that `randomPick()` burns an extra `Math.random()` call, so one combat round consumes up to 4 calls (documented in `combat.test.js`).

The suite covers game logic only. New 3D room components and visual changes are verified by actually running the app (`npm run dev` + Playwright/browser) and checking real console output, log text, or sampled pixel values — this is standing practice and has caught many shipped-looking bugs (see PROJECT_STATUS.md §5). Any throwaway debug harness (e.g. a `DevPreview` swap in `main.jsx`) must be fully reverted before committing.
