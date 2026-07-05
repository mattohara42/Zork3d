# Zork 3D

A 3D remake of Zork I, built as a Vite + React + React Three Fiber app.

## Running it

```
npm install
npm run dev
```

## Structure

- `src/gameData/` — room and item dictionaries. Room text is sourced from
  Zork I's original released ZIL source (`historicalsource/zork1` on
  GitHub) rather than invented, so it matches the original game where a
  room is implemented at all.
- `src/state/useGameState.js` — the game engine: current room, inventory,
  flags, a scrolling narrative log, and every verb (movement, open/close,
  take/drop, examine, read, inventory, lamp toggle).
- `src/components/` — `ViewportCanvas` (the R3F canvas + fixed
  first-person camera), `SceneManager` (dispatches to a room component
  per room), `TextTerminal` (room text, log, direction buttons, command
  input), `rooms/` (one component per room, e.g. `WestOfHouse.jsx`), and
  `primitives/` (shared pieces reused across rooms - `Ground`,
  `HouseShell`, `Mailbox`, etc.).

Each room is a self-contained "stage": the camera never moves, and
switching rooms just mounts a different scene component - there's no
manual scene-graph teardown to manage.

## `legacy-vanilla/`

The original prototype: a single-file vanilla Three.js implementation with
no build step. Superseded by the React/R3F app above, kept for reference.

## Project status, decisions, and backlog

See [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for the full architectural
decision log, current room/item state, source material references, and
the backlog toward feature parity with the original game.
