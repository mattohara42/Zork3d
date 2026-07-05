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
| 17 | Trophy case score is **recomputed from scratch** off current case contents, not incremented/decremented by hand | Mirrors `TROPHY-CASE-FCN`'s own `SETG SCORE <+ BASE-SCORE (OTVAL-FROB)>` — taking a deposited treasure back out just naturally drops its points next render, no separate "undo the deposit bonus" code path to keep in sync |
| 18 | `moves` increments once per player action across three call sites (`moveRoom`, `interactWithObject`, `runCommand`'s verb switch), not per keystroke or render | `enter`/`leave` route through `moveRoom`, which already counts its own turn, so `runCommand` deliberately does *not* double-count those two - every other verb branch counts its own |
| 19 | Combat uses real HERO-MELEE/TROLL-MELEE flavor text, but simplified fixed-odds resolution instead of the source's strength-differential lookup tables | `DO-FIGHT`/`VILLAIN-BLOW`/`HERO-BLOW` resolve every blow through `DEF1-RES`/`DEF2-RES`/`DEF3-RES` tables keyed on a player "fight strength" that scales with score - replicating that exactly is a large, hard-to-verify undertaking disproportionate to the payoff; the actual combat *lines* the player reads are still verbatim source text, which is what the accuracy principle has always been about (facts and text, not internal RNG algorithms) |
| 20 | Losing a fight bounces the player back to the Cellar rather than killing them | There's no death/restart flow built yet (see backlog #13) - a real "you die" here would be the same category of shortcut already rejected once for the dark-room instant-death proposal. The bounce-back still routes through the normal `south` exit so the Cellar's own onEnter/pitch-black handling applies exactly as if the player had walked there |
| 21 | The Maze's diagonal-only exits (no cardinal alternative) are remapped to whichever cardinal is free on that room, not dropped or faked | This engine only supports 6 directions; the maze leans on 8-directional movement as *part* of its disorientation. Redundant diagonals (duplicate a cardinal to the same room) are dropped, matching how the house ring already handles NE/SE; sole diagonals are remapped and documented per-room in `rooms.js`, then the whole graph was traced by hand and verified live edge-by-edge to confirm nothing became unreachable |
| 22 | All 20 maze rooms share two components (`MazeRoom`/`MazeDeadEnd`) instead of one file each | The source's own joke is that they're indistinguishable ("all alike") - a per-room seed (hashed from the room id) varies rock placement just enough to not look like one frozen scene, without giving the player a real landmark, which would defeat the puzzle |

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

### 2.3 Rooms implemented (44)

| Room | Exits | Notable mechanics |
|---|---|---|
| West of House | N, S, E(blocked: boarded door), W→Forest 1 | Mailbox (open/close, contains leaflet) |
| North of House | S, E, N→Path | Trees, decorative |
| South of House | N, E, S→Forest 3 | — |
| Behind House | W, S, in→Kitchen (gated), E→Clearing | Window, starts "slightly ajar", `open window` required to enter |
| Kitchen | out→Behind House, W→Living Room, up→Attic, down(blocked: chimney) | Table (decorative); "Only Santa Claus climbs down chimneys" — chimney-down is a permanent dead end in canon, not a real path to the Studio |
| Attic (dark) | down→Kitchen | Rope + knife (takeable); table (decorative, distinct text from Kitchen's) |
| Living Room | E→Kitchen, W(blocked: nailed door), down→Cellar (gated) | Rug (`move rug` reveals trap door), trap door (open/close), trophy case (decorative), lamp + sword (takeable) |
| Cellar (dark) | up→Living Room (gated, one-shot lock), N→Troll Room, S→East of Chasm, W(blocked: ramp) | Trap door slams shut + bars on first descent; lantern-lit once lamp is lit and carried |
| Troll Room (dark) | S→Cellar, E(blocked, permanent for now - EW-Passage isn't built), W→Maze 1 (gated on defeating the troll) | Real combat via `attack`/`kill troll` (with or without the sword); winning removes the troll; losing bounces you to the Cellar (no death mechanic yet) |
| East of Chasm (dark) | N→Cellar, E→Gallery, down(blocked: chasm) | Bottomless chasm sunk into the floor ahead; pushed back from the camera so the lantern still lights visible ground when carried lit (see §5) |
| Gallery | W→East of Chasm, N→Studio | Has `ONBIT` in source — the one underground room that's naturally lit, so it uses the normal daylight rig instead of dark/lantern; painting (takeable) |
| Studio (dark) | S→Gallery, up→Kitchen (gated, inventory-limited) | Owner's manual (takeable, readable); up-chimney to Kitchen requires carrying the lamp + at most one other item, and succeeding also un-bars the Cellar's trap door (§1 decision 16) |
| Forest 1 | N→Grating Clearing, E→Path, S→Forest 3, W(blocked: machete needed), up(blocked: no climbable tree) | — |
| Forest 2 | N(blocked: impenetrable), E→Mountains, S→Clearing, W→Path, up(blocked) | — |
| Forest 3 | N→Clearing, E/S(blocked: undergrowth/storm), W→Forest 1, up(blocked) | — |
| Mountains | N/S/W→Forest 2, E/up(blocked: impassable) | Flavor dead end; all three "back" directions lead to the same room, matching canon exactly rather than collapsing to one exit |
| Forest Path | up→Up a Tree, N→Grating Clearing, E→Forest 2, S→North of House, W→Forest 1 | The climbable tree lives here |
| Up a Tree | down→Path, up(blocked: can't climb higher) | No `Ground` — a branch platform stands in for the floor plane, surrounded by leaf-cluster meshes instead of grass/sky; bird's nest + egg (takeable) |
| Clearing (grating) | E→Forest 2, W→Forest 1, S→Path, N(blocked), down(blocked — grate not revealed) | Grate/leaf-clearing puzzle not built yet; `down` is a real canon exit gated behind a puzzle we haven't implemented, not a fabricated permanent block |
| Clearing (plain) | N→Forest 2, S→Forest 3, W→Behind House, E→Canyon View | Same displayed name ("Clearing") as the grating one, matching canon — two distinct rooms, same DESC, different LDESC/exits |
| Canyon View | N→Clearing, E/down→Cliff Middle, W→Forest 3 (one-way), S(blocked: storm) | Canon's NW-to-Clearing is diagonal-only with no cardinal alternative, mapped to N since W is taken by Forest 3; Forest 3 has no exit back here, matching canon's own asymmetry |
| Rocky Ledge | up→Canyon View, down→Canyon Bottom | Midpoint of the climbable cliff |
| Canyon Bottom | up→Rocky Ledge, N→End of Rainbow | River runoff strip across the floor |
| End of Rainbow | S→Canyon Bottom | Canon's only exit is SW with no cardinal alt — mapped to S to avoid a dead end, since the other three exits (up/ne/east to the rainbow) all require a sceptre/rainbow puzzle not built yet; a rainbow arc renders east as pure flavor, not yet crossable. The invisible pot-of-gold treasure (only appears once the rainbow is solid) is deliberately not added as an item yet |
| Maze 1-15, Dead End 1-4, Grating Room (all dark) | See `rooms.js` for the full graph | Past the Troll Room's now-unblocked west exit. Every connection confirmed against `MAZE-DIODES`/each `ROOM`'s definition, including two deliberate self-loops (Maze-1 north, Maze-6/8/9/14 each have one) and the one-way "diode" passages (a warning logs before the move, e.g. Maze-9's `down`). About a third of the real connections are diagonal-only (no cardinal offered) - remapped to whichever cardinal was free on that room, documented per-room in `rooms.js`; traced the full graph afterward to confirm nothing became unreachable (verified live, every edge). All 20 rooms share two visual components (`MazeRoom`/`MazeDeadEnd`) since the source's own joke is that they "all alike" - a tiny per-room seed varies rock placement without giving real navigational landmarks. Maze-15's `east` (Cyclops Room) and Grating Room's `up` (needs a skeleton key from Maze-5) are both deliberately left unbuilt - separate puzzle chains, not part of this pass |

### 2.4 Items implemented (8)
- **leaflet** — starts in mailbox; readable ("WELCOME TO ZORK!..." — verbatim source text)
- **lamp** (brass lantern) — Living Room; light source; `light lamp`/`turn off lamp` requires carrying it
- **sword** (elvish, antique) — Living Room; takeable; no combat use yet
- **rope** — Attic; takeable, no use yet (canonically used to descend the Chasm/well elsewhere in the dungeon, not built yet)
- **knife** — Attic; takeable, no combat use yet
- **painting** — Gallery; takeable, a real treasure (value 4, tvalue 6); `put painting in case` scores it
- **ownersManual** ("manual") — Studio; takeable, readable (verbatim "Congratulations!..." source text)
- **egg** — Up a Tree (in the nest); takeable, a real treasure (value 5, tvalue 5); `put egg in case` scores it. The source's fragility mechanic (breaks if opened/dropped carelessly, tied into the thief NPC) is not modeled — plain take/examine/put only

### 2.5 Verbs / commands
- Movement: `north/south/east/west/up/down` (+ `n/s/e/w/u/d`), `in`/`enter`, `out`/`leave`; WASD + arrow keys
- Objects: `open`, `close`, `take`/`get`, `drop`, `put <thing> in/on <container>` (trophy case only), `move`/`push`/`raise` (rug only), `examine`/`x`, `read`, `attack`/`kill`/`hit`/`fight` (the troll only)
- Meta: `look`, `inventory`/`i`/`inv`, `help`, `score`, `light lamp`/`turn on lamp`, `turn off lamp`/`extinguish lamp`/`douse lamp`
- Click-to-interact on: mailbox, window, rug, trap door, lamp, sword, trophy case, troll (hover shows an `<Html>` label; click fires the same handler as the equivalent typed verb). Depositing into the case is typed-only (`put egg in case`) — no click affordance for a two-object verb yet, but taking a deposited treasure back out is a normal click like any other item

### 2.6 Known simplifications (deliberate, not bugs)
- No synonym support — each object has exactly one recognized name (e.g. "mailbox", not "box"); consistent throughout, not per-object
- No "raise rug" hint text before it's moved (source has a specific tease line here; skipped for scope)
- Dropping a lit lamp in a room does **not** leave that room lit (real Zork: a dropped lit light source keeps illuminating its room). Our `hasLampLit` is a single player-relative boolean, not per-room state
- Room text omits exits to still-unbuilt rooms (the Maze, EW-Passage, the dam area, etc.) rather than promising passages that don't work yet
- Rope/knife/manual have no gameplay function yet beyond take/examine/read — no rope-climbing mechanic
- Egg has no fragility/condition mechanic (breaks if handled carelessly in the source) — plain take/examine/put only
- Combat odds are a simplified fixed-probability stand-in for the source's strength-table lookup (§1 decision 19); losing a fight bounces you to the Cellar instead of a real death (§1 decision 20); the troll's disarmed state isn't reflected in the room's static text, only in the combat log itself
- `put` only understands the trophy case as a destination — there's no generic container system, since the case is the only real "put things in X" interaction in the game so far
- `moves` counts one turn per action across nearly every verb, rather than exactly matching which specific verbs consume a turn in the original engine (`look`/`inventory`/`help`/`score` are free here, matching the original's own informational commands; finer-grained exceptions beyond that aren't modeled)

---

## 3. Backlog — path to feature parity

Roughly ordered by what unlocks the most, not strict priority. Pull from
§4 (source files) when implementing any of these — do not reconstruct
room text or mechanics from memory.

### Near-term (extends the existing map/mechanics with no new subsystems)
1. ~~**Attic** (Kitchen `up`) and **Studio**~~ — done. Turned out Kitchen's `down` (chimney) is a permanent dead end in canon, so Studio's only real entrance is Kitchen→...→Living Room→Cellar→East of Chasm→Gallery→Studio; built all four rooms on that path for real reachability (user-confirmed scope)
2. ~~**Forest rooms** around the house~~ — done. `Forest1/2/3`, `Mountains`, `Path`, `UpATree`, `GratingClearing`, `Clearing`, wired to West/North/South/Behind House exactly on their canonical cardinal exits. The nest + jewel-encrusted egg (a real early treasure/puzzle) live in Up a Tree
3. ~~**Canyon View / Cliff Middle / Canyon Bottom / End of Rainbow**~~ (Clearing `east`) — done. The rainbow crossing (Aragain Falls, On the Rainbow, the invisible pot-of-gold treasure) needs the sceptre puzzle first — not built, left as a visible-but-uncrossable flavor rainbow rather than a fake exit
4. **The dam area** (reservoir, dam room/lobby/base) — reachable a different way (via the river/Dam Room, not yet connected to anything we've built), holds its own multi-step puzzle (wrench + bolt to drain the reservoir); bigger than the pure-geography passes so far, scope it separately
5. ~~**Trophy case scoring**~~ — done. `score`/`moves` state added to `useGameState`; `put <treasure> in case` deposits (typed-only, no click affordance yet), taking it back out un-scores it, `score` verb prints the verbatim V-SCORE text/rank thresholds. Fetched `gverbs.zil`/`gmain.zil` (not previously cached) to find `SCORE-UPD`/`BASE-SCORE`/`SCORE-OBJ`, since they're generic-engine routines, not in `1actions.zil`/`1dungeon.zil`
6. ~~**The Maze**~~ (Troll Room `west`) — done. All 15 numbered rooms, 4 dead ends, and the Grating Room, wired exactly per `MAZE-DIODES`/each `ROOM` definition. *Correction*: earlier notes here said this was reachable without combat via the grate - re-reading `GRATE-FUNCTION` showed that's backwards, the grate can only be unlocked from *inside* the maze (a skeleton key found at Maze-5), so it's an exit shortcut you earn, not an entrance. The Troll Room really was the only way in
7. **Grate/leaf-clearing puzzle** (Grating Room `up`) — small, self-contained puzzle (find leaves, dig with a shovel to reveal the grate, find the skeleton key at Maze-5 to unlock `GRUNLOCK`); becomes a *second* way in/out once solved, not an entrance on its own
8. ~~**Combat system**~~ — done. `attack`/`kill`/`hit`/`fight troll` (with or without the sword) in `useGameState`'s `attackTroll`; real `HERO-MELEE`/`TROLL-MELEE` flavor text (fetched from `gverbs.zil`/`1actions.zil`) over simplified fixed-odds resolution (§1 decisions 19-20). Winning sets `flags.trollDefeated`, removes the troll, and updates the room's blocked-exit messages; losing bounces the player to the Cellar rather than a real death, since there's no death/restart flow yet
9. **Cyclops Room / Strange Passage / Treasure Room** (Maze-15 `east`) — needs a new "speak a word" verb mechanic (saying "ULYSSES"/"ODYSSEUS" scares the cyclops away and breaks a hole straight through to the Living Room - the game's most famous shortcut); Treasure Room is the thief's hideaway, better sequenced alongside the thief NPC

### Requires a new subsystem
10. **NPCs beyond the troll** — thief (roams, steals/kills), cyclops (blocks a passage, solved by a spoken word not combat)
11. **`diagnose` verb** — death/health stats; blocked on a death mechanic existing at all (#14). `score`/`moves` themselves are done (see §3 near-term #5)
12. **Save/restore** — no persistence at all currently; page refresh loses all state
13. **Light source depletion** — the lamp is a battery lantern with finite life in the original; currently it never runs out
14. **Death mechanic** — "likely to be eaten by a grue" is flavor text only right now; there's no actual grue encounter or death/restart flow when lingering in the dark. Explicitly considered and declined once already: an instant Game Over the moment you *enter* any dark room without the lamp lit. Rejected because (a) the original never kills you on the first dark step — it warns, and only risks a probabilistic grue death if you keep acting while still in the dark, and (b) there's no Game Over screen/restart flow to land on yet. Build the real staged version here, not a shortcut bolted onto room transitions
15. **Rainbow/sceptre puzzle** — the sceptre (from the Egyptian Room, deep in the dungeon) waved on the rainbow makes it solid, opening On the Rainbow, Aragain Falls, and the pot-of-gold treasure. Blocked on reaching the sceptre's location first, so naturally sequenced after more of the underground is built
16. **Egg fragility** — breaks if opened/dropped carelessly in the source (`EGG-OBJECT`, `BAD-EGG`), tied into the thief NPC being the only safe way to open it. Needs a simple "damaged" condition flag on the item plus thief NPC support (#10) to be worth building

### Housekeeping / non-gameplay
17. No automated test suite — all verification so far has been manual (Playwright driven live-browser checks per change, not committed as regression tests)
18. Bundle size warning on build (`>500kB` single chunk) — candidate for route-level or R3F-scene code-splitting if it matters for load time
19. `legacy-vanilla/` is inert reference-only; consider deleting once nobody needs to diff against it

---

## 4. Source material (use this, not memory)

**Primary source:** [`historicalsource/zork1`](https://github.com/historicalsource/zork1)
— Infocom's own released ZIL source for the microcomputer version of
*Zork I: The Great Underground Empire* (published by the original
Infocom team via the Jason Scott / historicalsource GitHub org). This is
the authoritative reference for this project, not fan transcripts or
walkthroughs.

Four files cover essentially everything needed so far:
- `1dungeon.zil` — room (`<ROOM ...>`) and object (`<OBJECT ...>`) definitions: exits, `DESC`/`LDESC`/`FDESC`, flags (`ONBIT` = naturally lit, `INVISIBLE`, `TAKEBIT`, etc.), `VALUE`/`TVALUE` on treasures
- `1actions.zil` — Zork I-specific behavior routines (`<ROUTINE ...>`): verb handling, exact message text, one-shot effects like the trap door slam, room-specific `ACTION` functions (e.g. `TROPHY-CASE-FCN`)
- `gverbs.zil` / `gmain.zil` — the **generic** engine shared across the whole Zork trilogy, not Zork I-specific: this is where scoring (`SCORE-UPD`, `BASE-SCORE`, `SCORE-OBJ`), `V-SCORE`'s exact text/rank thresholds, and other cross-game verbs actually live. `1actions.zil` calls into these but doesn't define them - look here first for anything that feels like it should be "obviously somewhere" but isn't in the two Zork I files

Fetch directly rather than trusting recall:
```
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/1dungeon.zil
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/1actions.zil
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/gverbs.zil
curl -sSL https://raw.githubusercontent.com/historicalsource/zork1/master/gmain.zil
```
(All were cached in this session's scratchpad, not in the repo — re-fetch
in future sessions rather than assuming they're available locally.)

Related repos also seen during research, not currently needed:
- `historicalsource/zork` — the earlier mainframe MDL version (`dung.mud`)
- `MITDDC/zork` — the 1977 MIT original
- `PDP-10/zork` — another mainframe-era mirror

**Rooms/objects already cross-referenced against source:** West of House,
North of House, South of House, Behind House (+ kitchen window), Kitchen,
Living Room (+ rug, trap door, trophy case), Cellar, Troll Room (+ troll),
Attic, East of Chasm, Gallery, Studio, Forest 1/2/3, Mountains, Forest
Path, Up a Tree (+ nest), Grating Clearing, Clearing, Canyon View, Rocky
Ledge (Cliff Middle), Canyon Bottom, End of Rainbow, mailbox + leaflet,
lamp, sword, rope, knife, painting, owner's manual, egg. Combat:
`DO-FIGHT`/`FIGHT-STRENGTH`/`VILLAIN-STRENGTH`/`VILLAIN-BLOW`/`HERO-BLOW`/
`VILLAIN-RESULT` (`1actions.zil`), `HERO-MELEE`/`TROLL-MELEE` message
tables (`1actions.zil`), `GRATE-FUNCTION`/`GRATING-ROOM` (confirmed the
grate is exit-only, not an entrance). Maze: `MAZE-1` through `MAZE-15`,
`DEAD-END-1` through `DEAD-END-4`, `GRATING-ROOM`, `MAZE-DIODES`
(`1dungeon.zil`/`1actions.zil`) — every exit in `rooms.js` traced back
to one of these.

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
- **Ground-level objects placed too close to the camera render completely off-screen**, not just small. The fixed camera looks perfectly horizontal and never tilts down, so anything at `GROUND_Y` closer than roughly `z=-2.8` falls below the bottom edge of the frustum entirely. Hit this twice: the dropped leaflet at `z=-2` in West of House, and would have hit it again with the egg/nest in Up a Tree had it not been placed at `z=-3.6` from the start. Rule of thumb: keep ground-level props at `z ≤ -3` unless they have enough height to straddle the cutoff (like the mailbox or a torus-shaped item).

---

## 6. How to keep this document useful

- When adding a room or item, verify against source (§4) before writing text, and note here if a mechanic had to be simplified (§2.6) or deferred (§3).
- When making an architectural change, add a row to §1 rather than letting the "why" live only in a commit message.
- If a future session finds this doc drifting from the actual code, trust the code and fix the doc.
