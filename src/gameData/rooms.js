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

  livingRoom: {
    id: 'livingRoom',
    environment: 'surface',
    name: 'Living Room',
    text: (flags) => {
      let desc =
        'You are in the living room. There is a doorway to the east, a wooden ' +
        'door with strange gothic lettering to the west, which appears to be ' +
        'nailed shut, a trophy case, and ';
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
    exits: { east: 'kitchen', west: null, down: 'cellar' },
    blockedExits: { west: 'The door is nailed shut.' },
    exitGuards: {
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
    // East (EW-Passage) and west (the Maze) both really do open once the
    // troll is dealt with in canon. West has a real destination now that
    // the Maze exists, gated the same way the Cellar's `up`/Living
    // Room's `down` already are; east stays unbuilt since EW-Passage and
    // the rest of that side of the dungeon are a much larger separate pass.
    exits: { south: 'cellar', east: null, west: 'maze1' },
    blockedExits: {
      east: (flags) =>
        flags.trollDefeated
          ? "The passage beyond hasn't been explored yet."
          : 'The troll fends you off with a menacing gesture.',
    },
    exitGuards: {
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
    exits: { south: 'canyonBottom' },
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

  // SE (no cardinal alt, leads to the Cyclops Room) mapped to east -
  // left unbuilt for now, a separate pass past its own puzzle chain
  // (the cyclops, the "ULYSSES" wall-breaking shortcut to the Living
  // Room, the Treasure Room).
  maze15: {
    id: 'maze15',
    environment: 'underground',
    name: 'Maze',
    text: 'This is part of a maze of twisty little passages, all alike.',
    dark: true,
    exits: { west: 'maze14', south: 'maze7', east: null },
  },
};
