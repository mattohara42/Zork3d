// Room text is sourced from Zork I's original released ZIL source
// (historicalsource/zork1 on GitHub - 1dungeon.zil / 1actions.zil) rather
// than invented, so it matches the original game verbatim where a room is
// implemented at all. exitGuards mirrors the vanilla engine's pattern: a
// guard function returning a string blocks the move and shows that message;
// returning null/undefined lets it through.
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
    text: 'You are in the kitchen of the white house. A table seems to have been used recently for the preparation of food. To the east is a small window which is open.',
    exits: { out: 'behindHouse' },
  },
};
