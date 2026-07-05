// `location` is one of: a room id (dropped on the floor there), 'mailbox'
// (sitting inside the mailbox, only reachable while it's open), or
// 'inventory' (carried by the player).
export const INITIAL_ITEMS = {
  leaflet: {
    id: 'leaflet',
    name: 'leaflet',
    description: 'A small paper leaflet.',
    readText:
      '"WELCOME TO ZORK!\n\nZORK is a game of adventure, danger, and low cunning. In it you will explore some of the most amazing territory ever seen by mortals. No computer should be without one!"',
    portable: true,
    location: 'mailbox',
  },
};
