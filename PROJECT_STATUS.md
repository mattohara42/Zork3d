# Zork 3D — Project Status

Living reference doc: architectural decisions, current state, source
material, and the backlog toward feature parity with the original *Zork I*.
Update this file when a decision or the room/item map changes meaningfully.

---

## 1. Architecture decisions (chronological)

| # | Decision | Why |
|---|----------|-----|
| 1 | Started as a single-file vanilla Three.js prototype (`legacy-vanilla/index.html`) with 2 rooms | Fastest way to validate the GAME STATE / ROOM DICTIONARY / TRANSITION ENGINE split before investing in tooling |
| 2 | "Theater stage" transition model: camera never animates between rooms; each room's geometry is torn down and rebuilt fresh around a fixed camera | Avoids hand-rolled `requestAnimationFrame` easing loops; matches the discrete, room-to-room nature of text-adventure movement |
| 3 | Accuracy-first content policy | User directive: "no deviations or new content" — room text, verb responses, and mechanics must match the original where implemented, rather than being invented "in the spirit of" Zork |
| 4 | Canonical source of truth: **Infocom's released ZIL source**, not memory | `historicalsource/zork1` on GitHub (see §4). Caught and corrected real mistakes this way — see §6 |
| 5 | **Migrated the whole engine to Vite + React + React Three Fiber**, superseding the vanilla build | Explicit user request ("Migrate"). `legacy-vanilla/` kept only for reference, not maintained |
| 6 | Fixed **first-person** perspective camera at the world origin (not orbiting, not isometric) | Camera briefly used an orthographic isometric rig per an early spec, then explicitly changed to first-person. The camera still never moves — same "theater stage" principle carries over: rooms build their geometry around the fixed viewpoint via a shared `GROUND_Y`/`EYE_HEIGHT` convention (`primitives/Ground.jsx`) |
| 7 | State lives in one hook, `useGameState`, not scattered component state | Central place for room/inventory/flags/verbs; components are thin renderers of that state |
| 8 | Room `text` can be a plain string **or** a function of `flags` | Needed for rooms whose description genuinely varies (Living Room's rug/trap-door state), mirroring how the original's `LIVING-ROOM-FCN` composes text dynamically rather than storing one fixed string |
| 9 | Generic `floorText` mechanism on items | Any item whose `location` equals the current room auto-appends its `floorText` to the room description — mirrors the ZIL engine's generic FDESC/LDESC auto-listing instead of hand-coding "the lamp is here" into each room's text |
| 10 | `exitGuards`, `blockedExits`, `onEnter` room-data hooks | Generic, reusable primitives for gated movement (trap door needs rug moved + open), flavor-only dead ends (nailed door, unclimbable ramp), and one-shot room-entry effects (trap door slamming shut) — added once, reused everywhere |
| 11 | Interactive-object labels via drei's `<Html>`, shown on hover | Explicit instruction: no generated 3D text geometry. Reuses each object's existing hover state |
| 12 | Three-way lighting split: `isDark` / `isUnderground` / normal | A dark room with no lamp is truly lightless (no light components at all); the *same* dark room with the lamp lit gets a dim `ambientLight` + a `LanternLight` spotlight anchored to the player, not the outdoor daylight rig |
| 13 | `light lamp` requires the lamp to be **in inventory**, not just "reachable" | `isDark`/`isUnderground` is a single global boolean that travels with the player. Gating on "same room" would let the player light the lamp, walk away, and keep seeing in the dark despite leaving the actual lamp behind. Caught via live testing, not inspection |
| 14 | `src/components/rooms/*.jsx` (no "Scene" suffix) + `src/components/primitives/*.jsx` | Explicit restructure request; component function names match filenames |
| 15 | `RoomRegistry` object map replaces `SceneManager`'s switch statement | Adding a room is one registry entry + one component file, not a switch case to remember in a second place |
| 16 | `exitGuards` can return `{ flagUpdates }` on success, not just a block string | Needed for the Studio's up-chimney puzzle: climbing out isn't just allowed/denied, succeeding also resets `trapdoorBarred` so the Cellar route reopens — matches the ZIL `UP-CHIMNEY-FUNCTION`'s side effect, not just a pass/fail check |

**Standing engineering practice throughout:** every UI/behavior change in this
project has been verified by actually running the app (`npm run dev` +
Playwright) and reading real console output / pixel values / log text —
not just inspecting the diff. This caught several real bugs before they
shipped (see §6).

---

## 2. Current state

### 2.1 Tech stack
- Vite + React 19 + `@react-three/fiber` 9 + `@react-three/drei` 10 + `three` 0.185
- Lint: `oxlint` (`npm run lint`) — currently clean
- No test suite yet (see backlog)

### 2.2 File map
```
src/
  gameData/
    rooms.js       — room dictionary (text, exits, exitGuards, blockedExits, onEnter, dark)
    items.js       — item dictionary (location, portable, floorText, description, readText)
  state/
    useGameState.js       — the engine: state + every verb handler
    useKeyboardMovement.js — WASD/arrow-key movement
  components/
    App.jsx (root, wires the hook to the two panels)
    ViewportCanvas.jsx  — R3F <Canvas>, fixed first-person camera, 3-way lighting
    SceneManager.jsx    — looks up RoomRegistry[currentRoom]
    TextTerminal.jsx    — room text, scrolling log, direction buttons, command input
    rooms/              — one component per room (RoomRegistry.jsx maps id -> component)
    primitives/         — shared pieces: Ground, HouseShell, Mailbox, WindowPane, Tree,
                           ObjectLabel (drei Html labels), LanternLight (lantern spotlight)
legacy-vanilla/index.html — superseded single-file prototype, kept for reference only
```

### 2.3 Rooms implemented (12)

| Room | Exits | Notable mechanics |
|---|---|---|
| West of House | N, S, E(blocked: boarded door) | Mailbox (open/close, contains leaflet) |
| North of House | S, E | Trees, decorative |
| South of House | N, E | — |
| Behind House | W, S, in→Kitchen (gated) | Window, starts "slightly ajar", `open window` required to enter |
| Kitchen | out→Behind House, W→Living Room, up→Attic, down(blocked: chimney) | Table (decorative); "Only Santa Claus climbs down chimneys" — chimney-down is a permanent dead end in canon, not a real path to the Studio |
| Attic (dark) | down→Kitchen | Rope + knife (takeable); table (decorative, distinct text from Kitchen's) |
| Living Room | E→Kitchen, W(blocked: nailed door), down→Cellar (gated) | Rug (`move rug` reveals trap door), trap door (open/close), trophy case (decorative), lamp + sword (takeable) |
| Cellar (dark) | up→Living Room (gated, one-shot lock), N→Troll Room, S→East of Chasm, W(blocked: ramp) | Trap door slams shut + bars on first descent; lantern-lit once lamp is lit and carried |
| Troll Room (dark) | S→Cellar, E/W(blocked: troll, permanent) | Troll fixture, no combat system yet |
| East of Chasm (dark) | N→Cellar, E→Gallery, down(blocked: chasm) | Bottomless chasm sunk into the floor ahead; pushed back from the camera so the lantern still lights visible ground when carried lit (see §5) |
| Gallery | W→East of Chasm, N→Studio | Has `ONBIT` in source — the one underground room that's naturally lit, so it uses the normal daylight rig instead of dark/lantern; painting (takeable) |
| Studio (dark) | S→Gallery, up→Kitchen (gated, inventory-limited) | Owner's manual (takeable, readable); up-chimney to Kitchen requires carrying the lamp + at most one other item, and succeeding also un-bars the Cellar's trap door (§1 decision 16) |

### 2.4 Items implemented (7)
- **leaflet** — starts in mailbox; readable ("WELCOME TO ZORK!..." — verbatim source text)
- **lamp** (brass lantern) — Living Room; light source; `light lamp`/`turn off lamp` requires carrying it
- **sword** (elvish, antique) — Living Room; takeable; no combat use yet
- **rope** — Attic; takeable, no use yet (canonically used to descend the Chasm/well elsewhere in the dungeon, not built yet)
- **knife** — Attic; takeable, no combat use yet
- **painting** — Gallery; takeable (a real treasure in the original, but no trophy-case scoring subsystem yet — see §3)
- **ownersManual** ("manual") — Studio; takeable, readable (verbatim "Congratulations!..." source text)

### 2.5 Verbs / commands
- Movement: `north/south/east/west/up/down` (+ `n/s/e/w/u/d`), `in`/`enter`, `out`/`leave`; WASD + arrow keys
- Objects: `open`, `close`, `take`/`get`, `drop`, `move`/`push`/`raise` (rug only), `examine`/`x`, `read`
- Meta: `look`, `inventory`/`i`/`inv`, `help`, `light lamp`/`turn on lamp`, `turn off lamp`/`extinguish lamp`/`douse lamp`
- Click-to-interact on: mailbox, window, rug, trap door, lamp, sword, trophy case (hover shows an `<Html>` label; click fires the same handler as the equivalent typed verb)

### 2.6 Known simplifications (deliberate, not bugs)
- No synonym support — each object has exactly one recognized name (e.g. "mailbox", not "box"); consistent throughout, not per-object
- No "raise rug" hint text before it's moved (source has a specific tease line here; skipped for scope)
- Dropping a lit lamp in a room does **not** leave that room lit (real Zork: a dropped lit light source keeps illuminating its room). Our `hasLampLit` is a single player-relative boolean, not per-room state
- Room text omits exits to still-unbuilt rooms (the Maze, Forest, etc.) rather than promising passages that don't work yet
- Painting/rope/knife/manual have no gameplay function yet beyond take/examine/read — no trophy-case scoring, no rope-climbing mechanic, no combat

---

## 3. Backlog — path to feature parity

Roughly ordered by what unlocks the most, not strict priority. Pull from
§4 (source files) when implementing any of these — do not reconstruct
room text or mechanics from memory.

### Near-term (extends the existing map/mechanics with no new subsystems)
1. ~~**Attic** (Kitchen `up`) and **Studio**~~ — done. Turned out Kitchen's `down` (chimney) is a permanent dead end in canon, so Studio's only real entrance is Kitchen→...→Living Room→Cellar→East of Chasm→Gallery→Studio; built all four rooms on that path for real reachability (user-confirmed scope)
2. **Forest rooms** around the house (`FOREST-1`, `FOREST-2`, `FOREST-3`, `PATH`, `UP-A-TREE`, etc.) — mostly flavor rooms, some contain items (the "up a tree" nest with the egg is a real early puzzle)
3. **Trophy case scoring** — wire up `SETG SCORE` / treasure values now that the case exists as a fixture and there's a real treasure (painting) to deposit; needs a scoring concept in `useGameState` (`score`, `moves`) that doesn't exist yet
4. **The Maze** (Troll Room `west`, once past the troll) — reachable without combat, so doesn't strictly need #5 first

### Requires a new subsystem
5. **Combat system** — needed to ever get past the Troll Room's east/west exits (`TROLL-FLAG`). This is the single biggest gate blocking further underground progress (`EW-PASSAGE`, most of the dungeon). Real scope: a strength/damage model, the sword's "glowing" danger-proximity hint, flee/fight verbs
6. **NPCs beyond the troll** — thief (roams, steals/kills), cyclops (blocks a passage, solved by a spoken word not combat)
7. **Score/turn counter + `score`/`diagnose` verbs**
8. **Save/restore** — no persistence at all currently; page refresh loses all state
9. **Light source depletion** — the lamp is a battery lantern with finite life in the original; currently it never runs out
10. **Death mechanic** — "likely to be eaten by a grue" is flavor text only right now; there's no actual grue encounter or death/restart flow when lingering in the dark

### Housekeeping / non-gameplay
11. No automated test suite — all verification so far has been manual (Playwright driven live-browser checks per change, not committed as regression tests)
12. Bundle size warning on build (`>500kB` single chunk) — candidate for route-level or R3F-scene code-splitting if it matters for load time
13. `legacy-vanilla/` is inert reference-only; consider deleting once nobody needs to diff against it

---

## 4. Source material (use this, not memory)

**Primary source:** [`historicalsource/zork1`](https://github.com/historicalsource/zork1)
— Infocom's own released ZIL source for the microcomputer version of
*Zork I: The Great Underground Empire* (published by the original
Infocom team via the Jason Scott / historicalsource GitHub org). This is
the authoritative reference for this project, not fan transcripts or
walkthroughs.

Two files cover essentially everything needed so far:
- `1dungeon.zil` — room (`<ROOM ...>`) and object (`<OBJECT ...>`) definitions: exits, `DESC`/`LDESC`/`FDESC`, flags (`ONBIT` = naturally lit, `INVISIBLE`, `TAKEBIT`, etc.)
- `1actions.zil` — behavior routines (`<ROUTINE ...>`): verb handling, exact message text, one-shot effects like the trap door slam

Fetch directly rather than trusting recall:
```
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/1dungeon.zil
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/1actions.zil
```
(Both were cached in this session's scratchpad, not in the repo — re-fetch
in future sessions rather than assuming they're available locally.)

Related repos also seen during research, not currently needed:
- `historicalsource/zork` — the earlier mainframe MDL version (`dung.mud`)
- `MITDDC/zork` — the 1977 MIT original
- `PDP-10/zork` — another mainframe-era mirror

**Rooms/objects already cross-referenced against source:** West of House,
North of House, South of House, Behind House (+ kitchen window), Kitchen,
Living Room (+ rug, trap door, trophy case), Cellar, Troll Room (+ troll),
Attic, East of Chasm, Gallery, Studio, mailbox + leaflet, lamp, sword,
rope, knife, painting, owner's manual.

---

## 5. Corrections caught along the way (worth remembering)

These are real mistakes made and fixed during development — recorded so
they aren't repeated:

- **Trapdoor/Cellar location.** Early on, a trapdoor was built *outside* West of House. Canonically it's inside the Living Room, under a rug. Fixed by removing the outdoor version entirely and rebuilding it correctly once the Living Room existed, rather than inventing a new access point.
- **"Cellar has no way back up" — wrong.** Stated this from memory at one point; the source shows the trap door slams shut and bars only on the *first* descent, and there's a real `(UP TO LIVING-ROOM IF TRAP-DOOR IS OPEN)` exit. Corrected after re-reading the source.
- **`<color attach="background" args={[color]} />` didn't reliably update.** The declarative drei/R3F pattern silently kept the old background color despite state correctly changing. Caught by sampling actual rendered pixel RGB values (not eyeballing screenshots) and replaced with an imperative `scene.background = new Color(...)` in a `useEffect`.
- **Trophy case / lamp / sword positioned outside the camera frustum.** Placed at `x=3.5` while only 2 units deep — the math for the camera's field of view at that depth put them entirely off-screen despite all game logic working. Caught because the take/examine text worked but the screenshot showed nothing there.
- **`light lamp` didn't actually require possession** in its first pass — gated on "reachable" (same room OR inventory) instead of "carried", which let the player light it while it was still sitting on the trophy case.
- **East of Chasm looked pitch black even with the lamp lit.** The chasm pit (intentionally pure-black geometry) sat right at the edge of the lantern's cone and filled almost the entire forward view, so a mechanically-correct "lit" room was visually indistinguishable from `isDark`. Caught by sampling pixel RGB values (all `(0,0,0)`) rather than trusting the screenshot at a glance; fixed by moving the pit further from the camera so there's visible lit ground in front of it.

---

## 6. How to keep this document useful

- When adding a room or item, verify against source (§4) before writing text, and note here if a mechanic had to be simplified (§2.6) or deferred (§3).
- When making an architectural change, add a row to §1 rather than letting the "why" live only in a commit message.
- If a future session finds this doc drifting from the actual code, trust the code and fix the doc.
