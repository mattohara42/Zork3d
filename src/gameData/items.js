// `location` is one of: a room id (dropped on the floor there), 'mailbox'
// (sitting inside the mailbox, only reachable while it's open), or
// 'inventory' (carried by the player).
//
// `floorText`, if set, is auto-appended to a room's description whenever
// the item's `location` equals that room's id - mirrors the ZIL engine's
// generic FDESC/LDESC auto-listing (which is why the lamp and sword show
// up in the Living Room's text without LIVING-ROOM-FCN mentioning them
// directly in the source: that's handled by a separate, generic part of
// the original engine, not hand-coded per room).
export const INITIAL_ITEMS = {
  leaflet: {
    id: 'leaflet',
    name: 'leaflet',
    description: 'A small paper leaflet.',
    floorText: 'A small leaflet is on the ground.',
    readText:
      '"WELCOME TO ZORK!\n\nZORK is a game of adventure, danger, and low cunning. In it you will explore some of the most amazing territory ever seen by mortals. No computer should be without one!"',
    portable: true,
    location: 'mailbox',
  },

  lamp: {
    id: 'lamp',
    name: 'lamp',
    description: 'A battery-powered brass lantern.',
    floorText: 'A battery-powered brass lantern is on the trophy case.',
    portable: true,
    isLightSource: true,
    location: 'livingRoom',
  },

  sword: {
    id: 'sword',
    name: 'sword',
    description: 'An elvish sword of great antiquity.',
    floorText: 'Above the trophy case hangs an elvish sword of great antiquity.',
    portable: true,
    location: 'livingRoom',
  },
};
