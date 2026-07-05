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
    exits: { north: 'northOfHouse', south: 'southOfHouse', east: null },
  },

  northOfHouse: {
    id: 'northOfHouse',
    environment: 'surface',
    name: 'North of House',
    text: 'You are facing the north side of a white house. There is no door here, and all the windows are boarded up. To the north a narrow path winds through the trees.',
    exits: { south: 'westOfHouse', east: 'behindHouse' },
  },

  southOfHouse: {
    id: 'southOfHouse',
    environment: 'surface',
    name: 'South of House',
    text: 'You are facing the south side of a white house. There is no door here, and all the windows are boarded.',
    exits: { north: 'westOfHouse', east: 'behindHouse' },
  },

  behindHouse: {
    id: 'behindHouse',
    environment: 'surface',
    name: 'Behind House',
    text: 'You are behind the white house. In one corner of the house there is a small window which is slightly ajar.',
    exits: { west: 'northOfHouse', south: 'southOfHouse', in: 'kitchen' },
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
    // engine, not one hand-written paragraph.
    text:
      'This is a small room with passages to the east and south and a forbidding ' +
      'hole leading west. Bloodstains and deep scratches (perhaps made by an axe) ' +
      'mar the walls.\nA nasty-looking troll, brandishing a bloody axe, blocks all ' +
      'passages out of the room.',
    dark: true,
    exits: { south: 'cellar', east: null, west: null },
    // No combat system yet, so the troll is a permanent (for now)
    // roadblock exactly like the original until you deal with it.
    blockedExits: {
      east: 'The troll fends you off with a menacing gesture.',
      west: 'The troll fends you off with a menacing gesture.',
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
};
