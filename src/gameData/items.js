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

  rope: {
    id: 'rope',
    name: 'rope',
    description: 'A large coil of rope.',
    floorText: 'A large coil of rope is lying in the corner.',
    portable: true,
    location: 'attic',
  },

  knife: {
    id: 'knife',
    name: 'knife',
    description: 'A nasty-looking knife.',
    floorText: 'On a table is a nasty-looking knife.',
    portable: true,
    location: 'attic',
  },

  painting: {
    id: 'painting',
    name: 'painting',
    description: 'A painting of unparalleled beauty, by a neglected genius.',
    floorText:
      'Fortunately, there is still one chance for you to be a vandal, for on the far wall is a painting of unparalleled beauty.',
    portable: true,
    location: 'gallery',
  },

  // Real EGG-OBJECT in the source lets the egg get "seriously damaged" if
  // opened/dropped carelessly (a whole fragility/condition mechanic tied
  // into the thief NPC who can open it safely later). Not modeled yet -
  // this is just a plain takeable treasure for now, same simplification
  // already applied to the painting (no scoring/condition tracking).
  egg: {
    id: 'egg',
    name: 'egg',
    description: 'A jewel-encrusted egg.',
    floorText:
      "In the bird's nest is a large egg encrusted with precious jewels, apparently scavenged by a childless songbird. The egg is covered with fine gold inlay, and ornamented in lapis lazuli and mother-of-pearl. Unlike most eggs, this one is hinged and closed with a delicate looking clasp. The egg appears extremely fragile.",
    portable: true,
    location: 'upATree',
  },

  ownersManual: {
    id: 'ownersManual',
    name: 'manual',
    description: "ZORK owner's manual.",
    floorText: 'Loosely attached to a wall is a small piece of paper.',
    readText:
      'Congratulations!\n\nYou are the privileged owner of ZORK I: The Great Underground Empire, a self-contained and self-maintaining universe. If used and maintained in accordance with normal operating practices for small universes, ZORK will provide many months of trouble-free operation.',
    portable: true,
    location: 'studio',
  },
};
