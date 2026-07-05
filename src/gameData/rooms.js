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
// exitGuards: a guard function returning a string blocks the move and
// shows that message; returning null/undefined lets it through.
//
// blockedExits: a direction with no real destination but a specific
// "why not" message (the nailed-shut door, the unclimbable ramp) rather
// than the generic "You can't go that way."
//
// onEnter(flags): runs once after arriving in a room; can return
// { message, flagUpdates } for one-shot effects like the trap door
// slamming shut the first time you descend into the Cellar.
export const ROOMS = {
  westOfHouse: {
    id: 'westOfHouse',
    name: 'West of House',
    text: 'You are standing in an open field west of a white house, with a boarded front door. There is a small mailbox here.',
    exits: { north: 'northOfHouse', south: 'southOfHouse', east: null },
  },

  northOfHouse: {
    id: 'northOfHouse',
    name: 'North of House',
    text: 'You are facing the north side of a white house. There is no door here, and all the windows are boarded up. To the north a narrow path winds through the trees.',
    exits: { south: 'westOfHouse', east: 'behindHouse' },
  },

  southOfHouse: {
    id: 'southOfHouse',
    name: 'South of House',
    text: 'You are facing the south side of a white house. There is no door here, and all the windows are boarded.',
    exits: { north: 'westOfHouse', east: 'behindHouse' },
  },

  behindHouse: {
    id: 'behindHouse',
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
    name: 'Kitchen',
    text: 'You are in the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west, and to the east is a small window which is open.',
    exits: { out: 'behindHouse', west: 'livingRoom' },
  },

  livingRoom: {
    id: 'livingRoom',
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
    name: 'Cellar',
    text: 'You are in a dark and damp cellar. On the west is the bottom of a steep metal ramp which is unclimbable.',
    dark: true,
    exits: { up: 'livingRoom', west: null },
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
};
