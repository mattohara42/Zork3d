// Room text is sourced from Zork I's original released ZIL source
// (historicalsource/zork1 on GitHub - 1dungeon.zil / 1actions.zil) rather
// than invented, so it matches the original game verbatim where a room is
// implemented at all.
//
// `text` may be a plain string, or a function of the current flags for
// rooms whose description genuinely varies (the Living Room's rug/trap
// door state), matching how LIVING-ROOM-FCN composes its description in
// the original source rather than using a fixed string.
//
// exitGuards: a guard function (flags, inventory) returning a string
// blocks the move and shows that message. Returning null/undefined lets
// it through with no side effect; returning an object with flagUpdates
// lets it through *and* applies those updates (the up-chimney puzzle in
// the Studio needs this - climbing out successfully also resets the
// barred trap door).
//
// blockedExits: a direction with no real destination but a specific
// "why not" message (the nailed-shut door, the unclimbable ramp) rather
// than the generic "You can't go that way."
//
// onEnter(flags): runs once after arriving in a room; can return
// { message, flagUpdates } for one-shot effects like the trap door
// slamming shut the first time you descend into the Cellar.
//
// environment: 'surface' | 'underground' - geography, not lighting.
// The Gallery is 'underground' but has no `dark` flag (it's ONBIT in
// the source, naturally lit) - EnvironmentLighting treats "not dark"
// as the bright branch regardless of environment, so this stays a
// correct exception rather than forcing every underground room
// through the lantern-only path.
export const ROOMS = {
  westOfHouse: {
    id: 'westOfHouse',
    environment: 'surface',
    name: 'West of House',
    text: 'You are standing in an open field west of a white house, with a boarded front door. There is a small mailbox here.',
    exits: { north: 'northOfHouse', south: 'southOfHouse', east: null, west: 'forest1' },
  },

  northOfHouse: {
    id: 'northOfHouse',
    environment: 'surface',
    name: 'North of House',
    text: 'You are facing the north side of a white house. There is no door here, and all the windows are boarded up. To the north a narrow path winds through the trees.',
    exits: { south: 'westOfHouse', east: 'behindHouse', north: 'path' },
  },

  southOfHouse: {
    id: 'southOfHouse',
    environment: 'surface',
    name: 'South of House',
    text: 'You are facing the south side of a white house. There is no door here, and all the windows are boarded.',
    exits: { north: 'westOfHouse', east: 'behindHouse', south: 'forest3' },
  },

  behindHouse: {
    id: 'behindHouse',
    environment: 'surface',
    name: 'Behind House',
    text: 'You are behind the white house. In one corner of the house there is a small window which is slightly ajar.',
    exits: { west: 'northOfHouse', south: 'southOfHouse', in: 'kitchen', east: 'clearing' },
    exitGuards: {
      in: (flags) =>
        flags.windowOpen ? null : 'The window is not open wide enough to enter.',
    },
  },

  kitchen: {
    id: 'kitchen',
    environment: 'surface',
    name: 'Kitchen',
    text: 'You are in the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west, a dark staircase leads upward, and to the east is a small window which is open.',
    exits: { out: 'behindHouse', west: 'livingRoom', up: 'attic', down: null },
    // The chimney only ever works as a one-way shortcut back up from the
    // Studio - going down from the Kitchen end is permanently blocked.
    blockedExits: { down: 'Only Santa Claus climbs down chimneys.' },
  },

  attic: {
    id: 'attic',
    environment: 'surface',
    name: 'Attic',
    text: 'This is the attic. The only exit is a stairway leading down.',
    dark: true,
    exits: { down: 'kitchen' },
  },

  // West was a permanent "nailed shut" block until the Cyclops Room
  // existed - LIVING-ROOM-FCN swaps that entire sentence for a
  // "cyclops-shaped opening" once MAGIC-FLAG is set (saying "ULYSSES" to
  // the cyclops), matching a real canon exit, not a fabricated shortcut.
  livingRoom: {
    id: 'livingRoom',
    environment: 'surface',
    name: 'Living Room',
    text: (flags) => {
      let desc = 'You are in the living room. There is a doorway to the east, ';
      desc += flags.cyclopsFled
        ? 'a cyclops-shaped opening in an old wooden door to the west, above ' +
          'which is some strange gothic lettering, '
        : 'a wooden door with strange gothic lettering to the west, which ' +
          'appears to be nailed shut, ';
      desc += 'a trophy case, and ';
      if (flags.rugMoved && flags.trapdoorOpen) {
        desc += 'a rug lying beside an open trap door.';
      } else if (flags.rugMoved) {
        desc += 'a closed trap door at your feet.';
      } else if (flags.trapdoorOpen) {
        desc += 'an open trap door at your feet.';
      } else {
        desc += 'a large oriental rug in the center of the room.';
      }
      return desc;
    },
    exits: { east: 'kitchen', west: 'strangePassage', down: 'cellar' },
    exitGuards: {
      west: (flags) => (flags.cyclopsFled ? null : 'The door is nailed shut.'),
      down: (flags) => {
        if (!flags.rugMoved) return "You can't go that way.";
        if (!flags.trapdoorOpen) return 'The trap door is closed.';
        return null;
      },
    },
  },

  cellar: {
    id: 'cellar',
    environment: 'underground',
    name: 'Cellar',
    text: 'You are in a dark and damp cellar, with a narrow passageway leading north, and a crawlway to the south. On the west is the bottom of a steep metal ramp which is unclimbable.',
    dark: true,
    exits: { up: 'livingRoom', north: 'trollRoom', south: 'eastOfChasm', west: null },
    blockedExits: {
      west: 'You try to ascend the ramp, but it is impossible, and you slide back down.',
    },
    exitGuards: {
      up: (flags) => (flags.trapdoorOpen ? null : "You can't go that way."),
    },
    // Mirrors CELLAR-FCN's M-ENTER handler: the first time you descend
    // with the trap door open, it slams shut and bars behind you.
    onEnter: (flags) => {
      if (flags.trapdoorOpen && !flags.trapdoorBarred) {
        return {
          message: 'The trap door crashes shut, and you hear someone barring it.',
          flagUpdates: { trapdoorOpen: false, trapdoorBarred: true },
        };
      }
      return null;
    },
  },

  trollRoom: {
    id: 'trollRoom',
    environment: 'underground',
    name: 'The Troll Room',
    // The room's own LDESC, plus the troll's LDESC - in the original
    // source these are two separate objects auto-listed together by the
    // engine, not one hand-written paragraph. Once defeated the troll's
    // sentence drops out entirely, mirroring TROLL-FCN swapping the
    // LDESC rather than us hand-writing a "troll is gone" replacement.
    text: (flags) =>
      'This is a small room with passages to the east and south and a forbidding ' +
      'hole leading west. Bloodstains and deep scratches (perhaps made by an axe) ' +
      'mar the walls.' +
      (flags.trollDefeated
        ? ''
        : '\nA nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.'),
    dark: true,
    // East (EW-Passage) and west (the Maze) both really open once the
    // troll is dealt with in canon, gated the same way the Cellar's
    // `up`/Living Room's `down` already are.
    exits: { south: 'cellar', east: 'ewPassage', west: 'maze1' },
    exitGuards: {
      east: (flags) => (flags.trollDefeated ? null : 'The troll fends you off with a menacing gesture.'),
      west: (flags) => (flags.trollDefeated ? null : 'The troll fends you off with a menacing gesture.'),
    },
  },

  eastOfChasm: {
    id: 'eastOfChasm',
    environment: 'underground',
    name: 'East of Chasm',
    text: 'You are on the east edge of a chasm, the bottom of which cannot be seen. A narrow passage goes north, and the path you are on continues to the east.',
    dark: true,
    exits: { north: 'cellar', east: 'gallery', down: null },
    blockedExits: {
      down: 'The chasm probably leads straight to the infernal regions.',
    },
  },

  gallery: {
    id: 'gallery',
    environment: 'underground',
    name: 'Gallery',
    text: 'This is an art gallery. Most of the paintings have been stolen by vandals with exceptional taste. The vandals left through either the north or west exits.',
    exits: { west: 'eastOfChasm', north: 'studio' },
  },

  studio: {
    id: 'studio',
    environment: 'underground',
    name: 'Studio',
    text:
      "This appears to have been an artist's studio. The walls and floors are " +
      'splattered with paints of 69 different colors. Strangely enough, nothing ' +
      'of value is hanging here. At the south end of the room is an open door ' +
      '(also covered with paint). A dark and narrow chimney leads up from a ' +
      'fireplace; although you might be able to get up it, it seems unlikely ' +
      'you could get back down.',
    dark: true,
    exits: { south: 'gallery', up: 'kitchen' },
    // Mirrors UP-CHIMNEY-FUNCTION exactly: climbing out requires the lamp
    // and at most one other item. Succeeding also resets the barred trap
    // door, since this is an alternate way back to the surface.
    exitGuards: {
      up: (flags, inventory) => {
        if (inventory.length === 0) {
          return 'Going up empty-handed is a bad idea.';
        }
        if (inventory.includes('lamp') && inventory.length <= 2) {
          return { flagUpdates: { trapdoorBarred: false } };
        }
        return "You can't get up there with what you're carrying.";
      },
    },
  },

  forest1: {
    id: 'forest1',
    environment: 'surface',
    name: 'Forest',
    text: 'This is a forest, with trees in all directions. To the east, there appears to be sunlight.',
    exits: { north: 'gratingClearing', east: 'path', south: 'forest3', west: null, up: null },
    blockedExits: {
      west: 'You would need a machete to go further west.',
      up: 'There is no tree here suitable for climbing.',
    },
  },

  forest2: {
    id: 'forest2',
    environment: 'surface',
    name: 'Forest',
    text: 'This is a dimly lit forest, with large trees all around.',
    exits: { north: null, east: 'mountains', south: 'clearing', west: 'path', up: null },
    blockedExits: {
      north: 'The forest becomes impenetrable to the north.',
      up: 'There is no tree here suitable for climbing.',
    },
  },

  forest3: {
    id: 'forest3',
    environment: 'surface',
    name: 'Forest',
    text: 'This is a dimly lit forest, with large trees all around.',
    exits: { north: 'clearing', east: null, south: null, west: 'forest1', up: null },
    blockedExits: {
      east: 'The rank undergrowth prevents eastward movement.',
      south: 'Storm-tossed trees block your way.',
      up: 'There is no tree here suitable for climbing.',
    },
  },

  mountains: {
    id: 'mountains',
    environment: 'surface',
    name: 'Forest',
    text: 'The forest thins out, revealing impassable mountains.',
    exits: { north: 'forest2', south: 'forest2', west: 'forest2', east: null, up: null },
    blockedExits: {
      east: 'The mountains are impassable.',
      up: 'The mountains are impassable.',
    },
  },

  path: {
    id: 'path',
    environment: 'surface',
    name: 'Forest Path',
    text:
      'This is a path winding through a dimly lit forest. The path heads ' +
      'north-south here. One particularly large tree with some low branches ' +
      'stands at the edge of the path.',
    exits: { up: 'upATree', north: 'gratingClearing', east: 'forest2', south: 'northOfHouse', west: 'forest1' },
  },

  upATree: {
    id: 'upATree',
    environment: 'surface',
    name: 'Up a Tree',
    text:
      'You are about 10 feet above the ground nestled among some large ' +
      'branches. The nearest branch above you is above your reach.',
    exits: { down: 'path', up: null },
    blockedExits: { up: 'You cannot climb any higher.' },
  },

  // Same displayed name as `clearing` below (both are literally "Clearing"
  // in the source, distinguished only by description/exits). The grate
  // itself mirrors CLEARING-FCN's M-LOOK exactly: silent if never
  // revealed, "securely fastened" once revealed but still locked/closed,
  // "open...descending into darkness" once open. `down` only ever works
  // once it's open - unlocking has to happen from the Grating Room side
  // (Maze-5's skeleton key), matching canon's "can't reach the lock from
  // here."
  gratingClearing: {
    id: 'gratingClearing',
    environment: 'surface',
    name: 'Clearing',
    text: (flags) =>
      'You are in a clearing, with a forest surrounding you on all sides. A path leads south.' +
      (flags.grateOpen
        ? '\nThere is an open grating, descending into darkness.'
        : flags.grateRevealed
          ? '\nThere is a grating securely fastened into the ground.'
          : ''),
    exits: { east: 'forest2', west: 'forest1', south: 'path', north: null, down: 'gratingRoom' },
    blockedExits: { north: 'The forest becomes impenetrable to the north.' },
    exitGuards: {
      down: (flags) => {
        if (!flags.grateRevealed) return "You can't go that way.";
        if (!flags.grateOpen) return 'The grating is closed!';
        return null;
      },
    },
  },

  clearing: {
    id: 'clearing',
    environment: 'surface',
    name: 'Clearing',
    text: 'You are in a small clearing in a well marked forest path that extends to the east and west.',
    exits: { east: 'canyonView', north: 'forest2', south: 'forest3', west: 'behindHouse', up: null },
  },

  canyonView: {
    id: 'canyonView',
    environment: 'surface',
    name: 'Canyon View',
    text:
      'You are at the top of the Great Canyon on its west wall. From here ' +
      'there is a marvelous view of the canyon and parts of the Frigid River ' +
      'upstream. Across the canyon, the walls of the White Cliffs join the ' +
      'mighty ramparts of the Flathead Mountains to the east. Following the ' +
      'Canyon upstream to the north, Aragain Falls may be seen, complete with ' +
      'rainbow. The mighty Frigid River flows out from a great dark cavern. ' +
      'To the west and south can be seen an immense forest, stretching for ' +
      'miles around. A path leads northwest. It is possible to climb down ' +
      'into the canyon from here.',
    // Canon's own NW-to-Clearing exit is diagonal-only with no cardinal
    // alternative offered (unlike the house ring's redundant NE/SE, which
    // we just drop in favor of the cardinal already given) - mapped to
    // north since west is already Forest 3, to avoid a real dead end.
    exits: { north: 'clearing', east: 'cliffMiddle', down: 'cliffMiddle', west: 'forest3', south: null },
    blockedExits: { south: 'Storm-tossed trees block your way.' },
  },

  cliffMiddle: {
    id: 'cliffMiddle',
    environment: 'surface',
    name: 'Rocky Ledge',
    text:
      'You are on a ledge about halfway up the wall of the river canyon. ' +
      'You can see from here that the main flow from Aragain Falls twists ' +
      'along a passage which it is impossible for you to enter. Below you ' +
      'is the canyon bottom. Above you is more cliff, which appears climbable.',
    exits: { up: 'canyonView', down: 'canyonBottom' },
  },

  canyonBottom: {
    id: 'canyonBottom',
    environment: 'surface',
    name: 'Canyon Bottom',
    text:
      'You are beneath the walls of the river canyon which may be climbable ' +
      'here. The lesser part of the runoff of Aragain Falls flows by below. ' +
      'To the north is a narrow path.',
    exits: { up: 'cliffMiddle', north: 'endOfRainbow' },
  },

  // Canon's only way back from here is SW (no cardinal alternative), and
  // the other three exits all require RAINBOW-FLAG (a sceptre/rainbow
  // puzzle not built yet) - without a cardinal remap this would be a
  // genuine dead end, so SW maps to south rather than being silently
  // dropped like the house ring's redundant diagonals are.
  // Canon's up/NE/east all lead to On the Rainbow once RAINBOW-FLAG is
  // set (waving the sceptre here or at Aragain Falls) - collapsed to one
  // cardinal, east, since they're otherwise redundant. Aragain Falls
  // itself (upstream, past the falls) needs the river/boat system, not
  // built - so this is the only way to reach On the Rainbow/the pot of
  // gold, not a shortcut alongside a river route.
  endOfRainbow: {
    id: 'endOfRainbow',
    environment: 'surface',
    name: 'End of Rainbow',
    text:
      'You are on a small, rocky beach on the continuation of the Frigid ' +
      'River past the Falls. The beach is narrow due to the presence of the ' +
      'White Cliffs. The river canyon opens here and sunlight shines in from ' +
      'above. A rainbow crosses over the falls to the east and a narrow path ' +
      'continues to the southwest.',
    exits: { south: 'canyonBottom', east: 'onRainbow' },
    exitGuards: {
      east: (flags) => (flags.rainbowFlag ? null : "You can't go that way."),
    },
  },

  onRainbow: {
    id: 'onRainbow',
    environment: 'surface',
    name: 'On the Rainbow',
    text:
      'You are on top of a rainbow (I bet you never thought you would walk ' +
      'on a rainbow), with a magnificent view of the Falls. The rainbow ' +
      'travels east-west here.',
    exits: { west: 'endOfRainbow' },
    // Canon's east leads to Aragain Falls, reachable otherwise only via
    // the river/boat system - not built, so blocked here rather than
    // offering a shortcut that skips a whole unbuilt subsystem. Waving
    // the sceptre while standing here is also fatal in canon (the
    // rainbow's structural integrity fails under you) - see wave's own
    // handling in useGameState.
    blockedExits: {
      east: 'The mist and roar of the falls make it impossible to continue in that direction.',
    },
  },

  // The Maze: 15 numbered rooms, 4 dead ends, and the Grating Room, past
  // the Troll Room's now-unblocked west exit. Every connection below is
  // confirmed from the source's ROOM definitions and MAZE-DIODES
  // routine, not guessed - "twisty little passages, all alike" is a
  // deliberately disorienting, partly self-looping graph, and changing
  // it would defeat the point of the puzzle.
  //
  // Our engine only supports the 6 cardinal/vertical directions, but a
  // good third of the maze's real connections are diagonal-only (NE/NW/
  // SE/SW) with no cardinal alternative offered. Two remapping rules,
  // consistent with how the house ring and the canyon already handle
  // this:
  //   1. If a diagonal duplicates a cardinal to the same destination
  //      (e.g. Maze-14's NE and S both go to Maze-7), drop the diagonal.
  //   2. Otherwise, remap the diagonal to whichever cardinal on that
  //      room is still free, favoring the compass-adjacent one. Traced
  //      the whole graph afterward to confirm nothing became unreachable.
  //
  // The skeleton (with the keys needed to unlock the grate from inside)
  // and the rusty knife are real objects at Maze-5 in the source, but
  // both come with their own mini-puzzles (a curse if the skeleton is
  // disturbed carelessly, the sword's blue glow near the rusty knife) -
  // left as flavor text only for now, not interactive items.
  maze1: {
    id: 'maze1',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { east: 'trollRoom', north: 'maze1', south: 'maze2', west: 'maze4' },
  },

  maze2: {
    id: 'maze2',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { south: 'maze1', down: 'maze4', east: 'maze3' },
    exitGuards: {
      down: () => ({
        message:
          "You won't be able to get back up to the tunnel you are going " +
          'through when it gets to the next room.',
      }),
    },
  },

  maze3: {
    id: 'maze3',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { west: 'maze2', north: 'maze4', up: 'maze5' },
  },

  maze4: {
    id: 'maze4',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { west: 'maze3', north: 'maze1', east: 'deadEnd1' },
  },

  deadEnd1: {
    id: 'deadEnd1',
    environment: 'underground',
    name: 'Dead End',
    text: 'You have come to a dead end in the maze.',
    dark: true,
    exits: { south: 'maze4' },
  },

  // SW (no cardinal alt) mapped to west; the skeleton's own LDESC
  // sentence is appended here exactly as the source auto-lists it
  // alongside the room text.
  maze5: {
    id: 'maze5',
    environment: 'underground',
    name: 'Maze',
    text:
      'This is part of a maze of twisty little passages, all alike. ' +
      'A skeleton, probably the remains of a luckless adventurer, lies here.',
    dark: true,
    exits: { east: 'deadEnd2', north: 'maze3', west: 'maze6' },
  },

  deadEnd2: {
    id: 'deadEnd2',
    environment: 'underground',
    name: 'Dead End',
    text: 'You have come to a dead end in the maze.',
    dark: true,
    exits: { west: 'maze5' },
  },

  maze6: {
    id: 'maze6',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { down: 'maze5', east: 'maze7', west: 'maze6', up: 'maze9' },
  },

  maze7: {
    id: 'maze7',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { up: 'maze14', west: 'maze6', down: 'deadEnd1', east: 'maze8', south: 'maze15' },
    exitGuards: {
      down: () => ({
        message:
          "You won't be able to get back up to the tunnel you are going " +
          'through when it gets to the next room.',
      }),
    },
  },

  // NE (no cardinal alt) mapped to north; SE (no cardinal alt) mapped
  // to south.
  maze8: {
    id: 'maze8',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { north: 'maze7', west: 'maze8', south: 'deadEnd3' },
  },

  deadEnd3: {
    id: 'deadEnd3',
    environment: 'underground',
    name: 'Dead End',
    text: 'You have come to a dead end in the maze.',
    dark: true,
    exits: { north: 'maze8' },
  },

  // NW self-loop (no cardinal alt) mapped to up - every other cardinal
  // here is already spoken for by a real connection.
  maze9: {
    id: 'maze9',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { north: 'maze6', down: 'maze11', east: 'maze10', south: 'maze13', west: 'maze12', up: 'maze9' },
    exitGuards: {
      down: () => ({
        message:
          "You won't be able to get back up to the tunnel you are going " +
          'through when it gets to the next room.',
      }),
    },
  },

  maze10: {
    id: 'maze10',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { east: 'maze9', west: 'maze13', up: 'maze11' },
  },

  // NE (no cardinal alt) mapped to east; NW mapped to north; SW mapped
  // to west (pairs cleanly with Maze-12's own SW-to-here, also mapped
  // to west).
  maze11: {
    id: 'maze11',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { down: 'maze10', east: 'gratingRoom', north: 'maze13', west: 'maze12' },
  },

  // Mirrors MAZE-11-FCN's M-LOOK exactly across the three lock/open
  // states. SW (no cardinal alt) mapped to west. `up` needs the grate
  // both unlocked (skeleton key from Maze-5, unlock only works from this
  // side) and open - see the `unlockGrate`/`openObject` handlers in
  // useGameState.
  gratingRoom: {
    id: 'gratingRoom',
    environment: 'underground',
    name: 'Grating Room',
    text: (flags) =>
      'You are in a small room near the maze. There are twisty passages ' +
      'in the immediate vicinity. ' +
      (flags.grateOpen
        ? 'Above you is an open grating with sunlight pouring in.'
        : flags.grateUnlocked
          ? 'Above you is a grating.'
          : 'Above you is a grating locked with a skull-and-crossbones lock.'),
    dark: true,
    exits: { west: 'maze11', up: 'gratingClearing' },
    exitGuards: {
      up: (flags) => (flags.grateOpen ? null : 'The grating is closed.'),
    },
  },

  // SW (no cardinal alt) mapped to west, pairing with Maze-11's own
  // west-to-here.
  maze12: {
    id: 'maze12',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { down: 'maze5', west: 'maze11', east: 'maze13', up: 'maze9', north: 'deadEnd4' },
    exitGuards: {
      down: () => ({
        message:
          "You won't be able to get back up to the tunnel you are going " +
          'through when it gets to the next room.',
      }),
    },
  },

  deadEnd4: {
    id: 'deadEnd4',
    environment: 'underground',
    name: 'Dead End',
    text: 'You have come to a dead end in the maze.',
    dark: true,
    exits: { south: 'maze12' },
  },

  maze13: {
    id: 'maze13',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { east: 'maze9', down: 'maze12', south: 'maze10', west: 'maze11' },
  },

  // NW self-loop (no cardinal alt) mapped to north; NE dropped as
  // redundant with the existing cardinal south-to-Maze-7.
  maze14: {
    id: 'maze14',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { west: 'maze15', north: 'maze14', south: 'maze7' },
  },

  // SE (no cardinal alt) mapped to east - leads to the Cyclops Room.
  maze15: {
    id: 'maze15',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { west: 'maze14', south: 'maze7', east: 'cyclopsRoom' },
  },

  // NW (no cardinal alt) mapped to west, pairing with Maze-15's own
  // east-to-here. `east` (real wall/passage to Strange Passage) and `up`
  // (staircase to the Treasure Room) both require saying "ULYSSES" to
  // the cyclops first - only that solution is modeled, not the
  // alternate lunch/water sleep path from the source.
  cyclopsRoom: {
    id: 'cyclopsRoom',
    environment: 'underground',
    name: 'Cyclops Room',
    text: (flags) =>
      'This room has an exit on the northwest, and a staircase leading up.' +
      (flags.cyclopsFled
        ? ' The east wall, previously solid, now has a cyclops-sized opening in it.'
        : ' A cyclops, who looks prepared to eat horses (much less mere ' +
          'adventurers), blocks the staircase. From his state of health, ' +
          'and the bloodstains on the walls, you gather that he is not ' +
          'very friendly, though he likes people.'),
    exits: { west: 'maze15', east: 'strangePassage', up: 'treasureRoom' },
    exitGuards: {
      east: (flags) => (flags.cyclopsFled ? null : 'The east wall is solid rock.'),
      up: (flags) => (flags.cyclopsFled ? null : "The cyclops doesn't look like he'll let you past."),
    },
  },

  strangePassage: {
    id: 'strangePassage',
    environment: 'underground',
    name: 'Strange Passage',
    text:
      'This is a long passage. To the west is one entrance. On the east ' +
      'there is an old wooden door, with a large opening in it (about ' +
      'cyclops sized).',
    exits: { west: 'cyclopsRoom', in: 'cyclopsRoom', east: 'livingRoom' },
  },

  // VALUE 25 in the source is a one-time discovery bonus for the room
  // itself, not an item - see onEnter's scoreBonus in useGameState.
  // Bare of loot here since it's the thief's hideaway and there's no
  // thief NPC yet to have stashed anything.
  // The thief's own LDESC is appended while he's alive, same pattern as
  // the Troll Room - two separate objects auto-listed together in the
  // source, not one hand-written paragraph. Only the "say ULYSSES"-era
  // guardian version is modeled: no roaming, no stealing from other
  // rooms, no egg-safety payout on death (see PROJECT_STATUS.md).
  treasureRoom: {
    id: 'treasureRoom',
    environment: 'underground',
    name: 'Treasure Room',
    text: (flags) =>
      'This is a large room, whose east wall is solid granite. A number ' +
      'of discarded bags, which crumble at your touch, are scattered ' +
      'about on the floor. There is an exit down a staircase.' +
      (flags.thiefDefeated
        ? ''
        : '\nThere is a suspicious-looking individual, holding a large bag, leaning against one wall. He is armed with a deadly stiletto.'),
    exits: { down: 'cyclopsRoom' },
    onEnter: (flags) =>
      flags.treasureRoomVisited ? null : { flagUpdates: { treasureRoomVisited: true }, scoreBonus: 25 },
  },

  // The central hub connecting the Troll Room to the rest of the
  // dungeon. Round Room's own `south`/`SE` (Narrow Passage, Engravings
  // Cave) and Deep Canyon's `NW` (Reservoir South) are real in canon but
  // lead into the Temple/Egyptian Room network and the reservoir/boat
  // area respectively - both much larger separate passes, so those
  // exits are omitted here rather than promising passages that don't
  // work yet, same convention as everywhere else in this file.
  ewPassage: {
    id: 'ewPassage',
    environment: 'underground',
    name: 'East-West Passage',
    text: 'This is a narrow east-west passageway. There is a narrow stairway leading down at the north end of the room.',
    dark: true,
    exits: { east: 'roundRoom', west: 'trollRoom', down: 'chasmRoom', north: 'chasmRoom' },
    onEnter: (flags) => (flags.ewPassageVisited ? null : { flagUpdates: { ewPassageVisited: true }, scoreBonus: 5 }),
  },

  // Canon's S (Narrow Passage) and SE (Engravings Cave) are both real,
  // separate exits - SE has no cardinal alternative on this room, so it's
  // remapped to the only cardinal still free here, down.
  roundRoom: {
    id: 'roundRoom',
    environment: 'underground',
    name: 'Round Room',
    text: 'This is a circular stone room with passages in all directions. Several of them have unfortunately been blocked by cave-ins.',
    dark: true,
    exits: {
      east: 'loudRoom',
      west: 'ewPassage',
      north: 'nsPassage',
      south: 'narrowPassage',
      down: 'engravingsCave',
    },
  },

  // NE (no cardinal alt) mapped to east.
  nsPassage: {
    id: 'nsPassage',
    environment: 'underground',
    name: 'North-South Passage',
    text: 'This is a high north-south passage, which forks to the northeast.',
    dark: true,
    exits: { north: 'chasmRoom', east: 'deepCanyon', south: 'roundRoom' },
  },

  // SW (redundant with the cardinal UP, both reach East-West Passage) is
  // dropped, matching the house ring's own redundant-diagonal handling.
  chasmRoom: {
    id: 'chasmRoom',
    environment: 'underground',
    name: 'Chasm',
    text: 'A chasm runs southwest to northeast and the path follows it. You are on the south side of the chasm, where a crack opens into a passage.',
    dark: true,
    exits: { up: 'ewPassage', south: 'nsPassage', down: null },
    blockedExits: { down: 'Are you out of your mind?' },
  },

  // Simplified: always loud. Canon's exact state depends on GATES-OPEN
  // *and* a LOW-TIDE reservoir-draining timer we don't model (see the
  // Dam Room note below) - the real payoff there is the ECHO/platinum-
  // bar puzzle, deferred rather than half-built.
  loudRoom: {
    id: 'loudRoom',
    environment: 'underground',
    name: 'Loud Room',
    text:
      'This is a large room with a ceiling which cannot be detected from ' +
      'the ground. There is a narrow passage from east to west and a ' +
      'stone stairway leading upward. The room is deafeningly loud with ' +
      'an undetermined rushing sound. The sound seems to reverberate ' +
      'from all of the walls, making it difficult even to think.',
    dark: true,
    exits: { east: 'dampCave', west: 'roundRoom', up: 'deepCanyon' },
  },

  dampCave: {
    id: 'dampCave',
    environment: 'underground',
    name: 'Damp Cave',
    text: 'This cave has exits to the west and east, and narrows to a crack toward the south. The earth is particularly damp here.',
    dark: true,
    exits: { west: 'loudRoom', east: null, south: null },
    blockedExits: { south: 'It is too narrow for most insects.' },
  },

  // SW (no cardinal alt) mapped to west, pairing with North-South
  // Passage's own east-to-here.
  deepCanyon: {
    id: 'deepCanyon',
    environment: 'underground',
    name: 'Deep Canyon',
    text: 'You are on the south side of a deep canyon. The canyon runs to the northwest and the southeast; a small stream flows through it.',
    dark: true,
    exits: { east: 'damRoom', west: 'nsPassage', down: 'loudRoom' },
  },

  // Simplified: no LOW-TIDE reservoir-draining timer, so only two text
  // states (closed/open) instead of canon's four. West (Reservoir
  // South) is the reservoir/boat area, a separate large pass - omitted.
  damRoom: {
    id: 'damRoom',
    environment: 'underground',
    name: 'Dam',
    text: (flags) =>
      'You are standing on the top of the Flood Control Dam #3, which ' +
      'was quite a tourist attraction in times far distant. There are ' +
      'paths to the north, south, and west, and a scramble down.\n' +
      (flags.gatesOpen
        ? 'The sluice gates are open, and water rushes through the dam. ' +
          'The water level behind the dam is still high.'
        : 'The sluice gates on the dam are closed. Behind the dam, there ' +
          'can be seen a wide reservoir. Water is pouring over the top ' +
          'of the now abandoned dam.') +
      '\nThere is a control panel here, on which a large metal bolt is ' +
      'mounted. Directly above the bolt is a small green plastic bubble' +
      (flags.gateFlag ? ' which is glowing serenely' : '') +
      '.',
    exits: { south: 'deepCanyon', down: 'damBase', east: 'damBase', north: 'damLobby' },
  },

  damLobby: {
    id: 'damLobby',
    environment: 'underground',
    name: 'Dam Lobby',
    text:
      'This room appears to have been the waiting room for groups ' +
      'touring the dam. There are open doorways here to the north and ' +
      'east marked "Private", and there is a path leading south over ' +
      'the top of the dam.',
    exits: { south: 'damRoom', north: 'maintenanceRoom', east: 'maintenanceRoom' },
  },

  // No ONBIT in the source - genuinely dark, unlike the Dam Room/Lobby.
  // The button panel's red button toggles this room's own lights in
  // canon, independent of a carried lamp; not wired into the isDark
  // engine here (see useGameState's pushButton), just tracked for text.
  maintenanceRoom: {
    id: 'maintenanceRoom',
    environment: 'underground',
    name: 'Maintenance Room',
    text:
      'This is what appears to have been the maintenance room for Flood ' +
      'Control Dam #3. Apparently, this room has been ransacked ' +
      'recently, for most of the valuable equipment is gone. On the ' +
      'wall in front of you is a group of buttons colored blue, ' +
      'yellow, brown, and red. There are doorways to the west and south.',
    dark: true,
    exits: { south: 'damLobby', west: 'damLobby' },
  },

  damBase: {
    id: 'damBase',
    environment: 'underground',
    name: 'Dam Base',
    text:
      'You are at the base of Flood Control Dam #3, which looms above ' +
      'you and to the north. The river Frigid is flowing by here. Along ' +
      'the river are the White Cliffs which seem to form giant walls ' +
      'stretching from north to south along the shores of the river as ' +
      'it winds its way downstream.',
    exits: { north: 'damRoom', up: 'damRoom' },
  },

  // The Temple/Egyptian Room complex (Round Room's `down`) and the
  // Mirror Room maze (Round Room's `south`) - built together because in
  // canon the *only* way back out of the Temple side is through here:
  // South Temple's `down` (needs COFFIN-CURE) lands in the same Tiny
  // Cave this maze already reaches from Narrow Passage. `pray` at South
  // Temple is also a real, separate emergency exit straight to Forest 1.
  // Not modeled: the Entrance to Hades exorcism ritual (bell/candle/book)
  // and the Land of the Living Dead beyond it, Slide Room/Atlantis
  // Room/the reservoir-boat network past Small Cave, and the mirror's
  // MUNG-it-and-get-cursed side path - see PROJECT_STATUS.md.
  narrowPassage: {
    id: 'narrowPassage',
    environment: 'underground',
    name: 'Narrow Passage',
    text:
      'This is a long and narrow corridor where a long north-south ' +
      'passageway briefly narrows even further.',
    dark: true,
    exits: { north: 'roundRoom', south: 'mirrorRoom2' },
  },

  // ONBIT in the source - lit, unlike its twin Mirror Room 1.
  mirrorRoom2: {
    id: 'mirrorRoom2',
    environment: 'underground',
    name: 'Mirror Room',
    text:
      'You are in a large square room with tall ceilings. On the south ' +
      'wall is an enormous mirror which fills the entire wall. There ' +
      'are exits on the other three sides of the room.',
    exits: { west: 'windingPassage', north: 'narrowPassage', east: 'tinyCave' },
  },

  windingPassage: {
    id: 'windingPassage',
    environment: 'underground',
    name: 'Winding Passage',
    text: 'This is a winding passage. It seems that there are only exits on the east and north.',
    dark: true,
    exits: { north: 'mirrorRoom2', east: 'tinyCave' },
  },

  tinyCave: {
    id: 'tinyCave',
    environment: 'underground',
    name: 'Cave',
    text:
      'This is a tiny cave with entrances west and north, and a dark, ' +
      'forbidding staircase leading down.',
    dark: true,
    exits: { north: 'mirrorRoom2', west: 'windingPassage', down: 'entranceToHades' },
  },

  // The exorcism ritual (bell/candle/book) that lets you past the gate
  // into the Land of the Living Dead isn't modeled - see the file header
  // comment above. South is a real exit in the source (also reachable
  // from IN), gated on LLD-FLAG; blocked here since that flag can never
  // become true without the ritual.
  entranceToHades: {
    id: 'entranceToHades',
    environment: 'underground',
    name: 'Entrance to Hades',
    text:
      'You are outside a large gateway, on which is inscribed\n' +
      '  Abandon every hope\n' +
      'all ye who enter here!\n' +
      "The gate is open; through it you can see a desolation, with a pile of " +
      'mangled bodies in one corner. Thousands of voices, lamenting some ' +
      'hideous fate, can be heard.\n' +
      'The way through the gate is barred by evil spirits, who jeer at your ' +
      'attempts to pass.',
    dark: true,
    exits: { up: 'tinyCave' },
    blockedExits: {
      south: 'The way through the gate is barred by evil spirits, who jeer at your attempts to pass.',
    },
  },

  // No ONBIT - dark, unlike Mirror Room 2.
  mirrorRoom1: {
    id: 'mirrorRoom1',
    environment: 'underground',
    name: 'Mirror Room',
    text:
      'You are in a large square room with tall ceilings. On the south ' +
      'wall is an enormous mirror which fills the entire wall. There ' +
      'are exits on the other three sides of the room.',
    dark: true,
    exits: { north: 'coldPassage', west: 'twistingPassage', east: 'smallCave' },
  },

  // West (Slide Room, a shortcut to the Cellar tangled up in a separate
  // timber/bank-heist puzzle) isn't built - blocked rather than faked.
  coldPassage: {
    id: 'coldPassage',
    environment: 'underground',
    name: 'Cold Passage',
    text:
      'This is a cold and damp corridor where a long east-west ' +
      'passageway turns into a southward path.',
    dark: true,
    exits: { south: 'mirrorRoom1' },
    blockedExits: { west: 'It is too cold to continue that way.' },
  },

  twistingPassage: {
    id: 'twistingPassage',
    environment: 'underground',
    name: 'Twisting Passage',
    text: 'This is a winding passage. It seems that there are only exits on the east and north.',
    dark: true,
    exits: { north: 'mirrorRoom1', east: 'smallCave' },
  },

  // Canon's down/south both lead to Atlantis Room (needs the reservoir/
  // boat system, not built) - collapsed to one blocked direction.
  smallCave: {
    id: 'smallCave',
    environment: 'underground',
    name: 'Cave',
    text: 'This is a tiny cave with entrances west and north, and a staircase leading down.',
    dark: true,
    exits: { north: 'mirrorRoom1', west: 'twistingPassage' },
    blockedExits: { down: 'The staircase is flooded beyond this point.' },
  },

  // NW (no cardinal alt) mapped to up, matching the room's own downward
  // relationship to Round Room above it.
  engravingsCave: {
    id: 'engravingsCave',
    environment: 'underground',
    name: 'Engravings Cave',
    text: 'You have entered a low cave with passages leading northwest and east.',
    dark: true,
    exits: { up: 'roundRoom', east: 'domeRoom' },
  },

  domeRoom: {
    id: 'domeRoom',
    environment: 'underground',
    name: 'Dome Room',
    text: (flags) =>
      'You are at the periphery of a large dome, which forms the ceiling ' +
      'of another room below. Protecting you from a precipitous drop is a ' +
      'wooden railing which circles the dome.' +
      (flags.domeFlag
        ? '\nHanging down from the railing is a rope which ends about ten feet from the floor below.'
        : ''),
    dark: true,
    exits: { west: 'engravingsCave', down: 'torchRoom' },
    exitGuards: {
      down: (flags) => (flags.domeFlag ? null : 'You cannot go down without fracturing many bones.'),
    },
  },

  torchRoom: {
    id: 'torchRoom',
    environment: 'underground',
    name: 'Torch Room',
    text: (flags) =>
      'This is a large room with a prominent doorway leading to a down ' +
      'staircase. Above you is a large dome. Up around the edge of the ' +
      'dome (20 feet up) is a wooden railing. In the center of the room ' +
      'sits a white marble pedestal.' +
      (flags.domeFlag
        ? '\nA piece of rope descends from the railing above, ending some five feet above your head.'
        : ''),
    dark: true,
    exits: { south: 'northTemple' },
    blockedExits: { up: 'You cannot reach the rope.' },
  },

  // ONBIT + SACREDBIT in the source - lit like the Gallery/Dam Room.
  // Canon's OUT/UP/NORTH (all to Torch Room) and DOWN/EAST (both to
  // Egyptian Room) are each collapsed to one direction.
  northTemple: {
    id: 'northTemple',
    environment: 'underground',
    name: 'Temple',
    text:
      'This is the north end of a large temple. On the east wall is an ' +
      'ancient inscription, probably a prayer in a long-forgotten ' +
      'language. Below the prayer is a staircase leading down. The west ' +
      'wall is solid granite. The exit to the north end of the room is ' +
      'through huge marble pillars.',
    exits: { north: 'torchRoom', east: 'egyptRoom', south: 'southTemple' },
  },

  // Canon's WEST/UP (both to North Temple) collapsed to one direction.
  egyptRoom: {
    id: 'egyptRoom',
    environment: 'underground',
    name: 'Egyptian Room',
    text: 'This is a room which looks like an Egyptian tomb. There is an ascending staircase to the west.',
    dark: true,
    exits: { west: 'northTemple' },
  },

  // ONBIT + SACREDBIT - lit. `down` needs COFFIN-CURE (not carrying the
  // coffin) - matches SOUTH-TEMPLE-FCN exactly, recomputed live off
  // current inventory rather than a one-time flag.
  southTemple: {
    id: 'southTemple',
    environment: 'underground',
    name: 'Altar',
    text:
      'This is the south end of a large temple. In front of you is what ' +
      'appears to be an altar. In one corner is a small hole in the ' +
      'floor which leads into darkness. You probably could not get back ' +
      'up it.',
    exits: { north: 'northTemple', down: 'tinyCave' },
    exitGuards: {
      down: (flags, inventory) =>
        inventory.includes('coffin') ? "You haven't a prayer of getting the coffin down there." : null,
    },
  },
};
