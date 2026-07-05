// Verbatim (with F-WEP/F-DEF placeholders resolved to "sword"/"the troll")
// flavor text pulled from the trilogy's shared HERO-MELEE and the Zork I
// TROLL-MELEE message tables in gverbs.zil/1actions.zil - real combat
// lines, not invented ones. What's simplified is the probability model:
// the original resolves each blow through a strength-differential lookup
// table (DEF1-RES/DEF2-RES/DEF3-RES) driven by a player "fight strength"
// that scales with score; this uses fixed, hand-tuned odds instead. See
// PROJECT_STATUS.md for why that trade was made.

export const HERO_MISS = [
  'Your sword misses the troll by an inch.',
  'A good slash, but it misses the troll by a mile.',
  'You charge, but the troll jumps nimbly aside.',
  'Clang! Crash! The troll parries.',
  'A quick stroke, but the troll is on guard.',
  "A good stroke, but it's too slow; the troll dodges.",
];

export const HERO_LIGHT_WOUND = [
  'The troll is struck on the arm; blood begins to trickle down.',
  "Your sword pinks the troll on the wrist, but it's not serious.",
  'Your stroke lands, but it was only the flat of the blade.',
  "The blow lands, making a shallow gash in the troll's arm!",
];

export const HERO_SERIOUS_WOUND = [
  'The troll receives a deep gash in his side.',
  'A savage blow on the thigh! The troll is stunned but can still fight!',
  'Slash! Your blow lands! That one hit an artery, it could be serious!',
  "Slash! Your stroke connects! This could be serious!",
];

export const HERO_STAGGER = [
  'The troll is staggered, and drops to his knees.',
  "The troll is momentarily disoriented and can't fight back.",
  'The force of your blow knocks the troll back, stunned.',
  "The troll is confused and can't fight back.",
  'The quickness of your thrust knocks the troll back, stunned.',
];

export const HERO_DISARM = [
  "The troll's weapon is knocked to the floor, leaving him unarmed.",
  'The troll is disarmed by a subtle feint past his guard.',
];

export const HERO_KILL = [
  "It's curtains for the troll as your sword removes his head.",
  'The fatal blow strikes the troll square in the heart: He dies.',
  'The troll takes a fatal blow and slumps to the floor dead.',
];

export const TROLL_MISS = [
  'The troll swings his axe, but it misses.',
  "The troll's axe barely misses your ear.",
  'The axe sweeps past as you jump aside.',
  'The axe crashes against the rock, throwing sparks!',
];

export const TROLL_LIGHT_WOUND = [
  'The axe gets you right in the side. Ouch!',
  "The flat of the troll's axe skins across your forearm.",
  "The troll's swing almost knocks you over as you barely parry in time.",
  'The troll swings his axe, and it nicks your arm as you dodge.',
];

export const TROLL_SERIOUS_WOUND = [
  'The troll charges, and his axe slashes you on your sword arm.',
  'An axe stroke makes a deep wound in your leg.',
  "The troll's axe swings down, gashing your shoulder.",
];

export const TROLL_DISARM = [
  'The axe hits your sword and knocks it spinning.',
  'The troll swings, you parry, but the force of his blow knocks your sword away.',
  "The axe knocks your sword out of your hand. It falls to the floor.",
];

export const TROLL_STRENGTH = 2;
export const PLAYER_MAX_HEALTH = 3;
