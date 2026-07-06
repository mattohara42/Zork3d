// `location` is one of: a room id (dropped on the floor there), 'mailbox'
// (sitting inside the mailbox, only reachable while it's open),
// 'trophyCase' (deposited, only reachable in the Living Room, scores its
// tvalue - see useGameState's `score`), or 'inventory' (carried by the
// player).
//
// `floorText`, if set, is auto-appended to a room's description whenever
// the item's `location` equals that room's id - mirrors the ZIL engine's
// generic FDESC/LDESC auto-listing (which is why the lamp and sword show
// up in the Living Room's text without LIVING-ROOM-FCN mentioning them
// directly in the source: that's handled by a separate, generic part of
// the original engine, not hand-coded per room).
//
// `value`/`tvalue` (treasures only) mirror the source's VALUE/TVALUE:
// `value` is a one-time bonus paid out the first time the item is taken;
// `tvalue` is added to the score for as long as it sits in the trophy
// case (removed again if taken back out).
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

  // value = one-time bonus for taking it (VALUE in source); tvalue =
  // points while it sits in the trophy case (TVALUE) - recomputed live
  // off whatever's actually deposited, not accumulated by hand.
  painting: {
    id: 'painting',
    name: 'painting',
    description: 'A painting of unparalleled beauty, by a neglected genius.',
    floorText:
      'Fortunately, there is still one chance for you to be a vandal, for on the far wall is a painting of unparalleled beauty.',
    portable: true,
    value: 4,
    tvalue: 6,
    location: 'gallery',
  },

  // EGG-OBJECT: opening it yourself either refuses ("neither the tools
  // nor the expertise" - no knife) or damages it (with the knife); the
  // only way to open it undamaged is to give it to the thief and let him
  // die holding it (see useGameState's giveItem/attackThief - mirrors
  // DEPOSIT-BOOTY setting EGG-SOLVE). `broken`, once true, means the
  // egg's own fields below have been mutated in place to the source's
  // BROKEN-EGG stats/text rather than swapping to a separate item id.
  egg: {
    id: 'egg',
    name: 'egg',
    description: 'A jewel-encrusted egg.',
    floorText:
      "In the bird's nest is a large egg encrusted with precious jewels, apparently scavenged by a childless songbird. The egg is covered with fine gold inlay, and ornamented in lapis lazuli and mother-of-pearl. Unlike most eggs, this one is hinged and closed with a delicate looking clasp. The egg appears extremely fragile.",
    portable: true,
    value: 5,
    tvalue: 5,
    location: 'upATree',
    broken: false,
  },

  // Starts hidden inside the egg (location 'insideEgg' is never a real
  // room, so it's unreachable) until the egg is opened one way or the
  // other, at which point its location is set to wherever the egg is.
  // The source's follow-on WIND-CANARY/forest-bird/bauble chain isn't
  // modeled - see PROJECT_STATUS.md.
  canary: {
    id: 'canary',
    name: 'canary',
    description: 'A golden clockwork canary.',
    floorText:
      'There is a golden clockwork canary nestled in the egg. It has ruby eyes and a silver beak.',
    portable: true,
    value: 6,
    tvalue: 4,
    location: 'insideEgg',
    broken: false,
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

  // Moving or taking it reveals the grate underneath (LEAVES-APPEAR in
  // the source also fires on burn/look-under, which aren't verbs this
  // game supports yet for anything, not just here).
  leaves: {
    id: 'leaves',
    name: 'leaves',
    description: 'A pile of leaves.',
    floorText: 'On the ground is a pile of leaves.',
    portable: true,
    location: 'gratingClearing',
  },

  // No FDESC/LDESC on KEYS in the source - it just uses the engine's
  // generic "there is an X here" fallback, which is what floorText is
  // standing in for here.
  keys: {
    id: 'keys',
    name: 'key',
    description: 'A skeleton key.',
    floorText: 'There is a skeleton key here.',
    portable: true,
    location: 'maze5',
  },

  // No FDESC/LDESC on WRENCH either - same generic fallback pattern as
  // the keys.
  wrench: {
    id: 'wrench',
    name: 'wrench',
    description: 'A wrench.',
    floorText: 'There is a wrench here.',
    portable: true,
    location: 'maintenanceRoom',
  },

  guide: {
    id: 'guide',
    name: 'guide',
    description: 'A tour guidebook.',
    floorText: 'Some guidebooks entitled "Flood Control Dam #3" are on the reception desk.',
    readText:
      '"\tFlood Control Dam #3\n\nFCD#3 was constructed in year 783 of the Great Underground Empire to harness the mighty Frigid River. This work was supported by a grant of 37 million zorkmids from your omnipotent local tyrant Lord Dimwit Flathead the Excessive. This impressive structure is composed of 370,000 cubic feet of concrete, is 256 feet tall at the center, and 193 feet wide at the top. The lake created behind the dam has a volume of 1.7 billion cubic feet, an area of 12 million square feet, and a shore line of 36 thousand feet.\n\nThe construction of FCD#3 took 112 days from ground breaking to the dedication. It required a work force of 384 slaves, 34 slave drivers, 12 engineers, 2 turtle doves, and a partridge in a pear tree. The work was managed by a command team composed of 2345 bureaucrats, 2347 secretaries (at least two of whom could type), 12,256 paper shufflers, 52,469 rubber stampers, 245,193 red tape processors, and nearly one million dead trees.\n\nWe will now point out some of the more interesting features of FCD#3 as we conduct you on a guided tour of the facilities:\n\n\t1) You start your tour here in the Dam Lobby. You will notice on your right that....',
    portable: true,
    location: 'damLobby',
  },

  // Guarded by the thief until he's defeated - see CHALICE-FCN's "You'd be
  // stabbed in the back first" special case in useGameState's takeItem.
  chalice: {
    id: 'chalice',
    name: 'chalice',
    description: 'A silver chalice, intricately engraved.',
    floorText: 'There is a silver chalice, intricately engraved, here.',
    portable: true,
    value: 10,
    tvalue: 5,
    location: 'treasureRoom',
  },

  // Starts closed (no OPENBIT in the source) - `open coffin` reveals the
  // sceptre inside (see useGameState's openObject). SACREDBIT/the
  // COFFIN-CURE mechanic (South Temple won't let you carry it down to
  // Tiny Cave) is handled by southTemple's own exitGuard in rooms.js.
  coffin: {
    id: 'coffin',
    name: 'coffin',
    description: 'A solid-gold coffin.',
    floorText: 'The solid-gold coffin used for the burial of Ramses II is here.',
    portable: true,
    value: 10,
    tvalue: 15,
    location: 'egyptRoom',
  },

  // Starts hidden inside the coffin (location 'insideCoffin' is never a
  // real room) until the coffin is opened.
  sceptre: {
    id: 'sceptre',
    name: 'sceptre',
    description: 'An ornamented sceptre, tapering to a sharp point.',
    floorText:
      'A sceptre, possibly that of ancient Egypt itself, is in the coffin. The sceptre is ornamented with colored enamel, and tapers to a sharp point.',
    portable: true,
    value: 4,
    tvalue: 6,
    location: 'insideCoffin',
  },

  // A real treasure, but not modeled as an alternate light source (the
  // source's torch is FLAMEBIT/ONBIT/LIGHTBIT - always-lit and usable
  // like the lamp) - see PROJECT_STATUS.md.
  torch: {
    id: 'torch',
    name: 'torch',
    description: 'A flaming torch, made of ivory.',
    floorText: 'Sitting on the pedestal is a flaming torch, made of ivory.',
    portable: true,
    value: 14,
    tvalue: 6,
    location: 'torchRoom',
  },

  // NDESCBIT/SACREDBIT in the source (no separate FDESC) - decorative
  // and readable only, not takeable.
  prayer: {
    id: 'prayer',
    name: 'prayer',
    description: 'An ancient inscription.',
    readText:
      'The prayer is inscribed in an ancient script, rarely used today. It seems to be a philippic against small insects, absent-mindedness, and the picking up and dropping of small objects. The final verse consigns trespassers to the land of the dead. All evidence indicates that the beliefs of the ancient Zorkers were obscure.',
    portable: false,
    location: 'northTemple',
  },

  // INVISIBLE until the sceptre is waved at End of Rainbow (or, in the
  // source, Aragain Falls - not built) - see wave's handling in
  // useGameState. `insideEgg`-style non-room location stands in for
  // INVISIBLE here, same trick used for the canary.
  potOfGold: {
    id: 'potOfGold',
    name: 'pot of gold',
    description: 'A shimmering pot of gold.',
    floorText: 'At the end of the rainbow is a pot of gold.',
    portable: true,
    value: 10,
    tvalue: 10,
    location: 'notYetRevealed',
  },
};
