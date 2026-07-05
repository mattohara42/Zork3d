// Verbatim flavor text pulled from the trilogy's shared HERO-MELEE and the
// Zork I TROLL-MELEE/THIEF-MELEE message tables in gverbs.zil/1actions.zil -
// real combat lines, not invented ones. What's simplified is the probability
// model: the original resolves each blow through a strength-differential
// lookup table (DEF1-RES/DEF2-RES/DEF3-RES) driven by a player "fight
// strength" that scales with score; this uses fixed, hand-tuned odds
// instead. See PROJECT_STATUS.md for why that trade was made.
//
// HERO-MELEE is one shared table in the source (an F-DEF placeholder is
// filled in with whichever villain you're fighting), so it's kept as
// templates here too instead of duplicating a "the troll" and "the thief"
// copy of every line - resolveHero() fills in the placeholder.

const HERO_MISS_T = [
  'Your sword misses {def} by an inch.',
  'A good slash, but it misses {def} by a mile.',
  'You charge, but {def} jumps nimbly aside.',
  'Clang! Crash! {Def} parries.',
  'A quick stroke, but {def} is on guard.',
  "A good stroke, but it's too slow; {def} dodges.",
];

const HERO_LIGHT_WOUND_T = [
  '{Def} is struck on the arm; blood begins to trickle down.',
  "Your sword pinks {def} on the wrist, but it's not serious.",
  'Your stroke lands, but it was only the flat of the blade.',
  "The blow lands, making a shallow gash in {def}'s arm!",
];

const HERO_SERIOUS_WOUND_T = [
  '{Def} receives a deep gash in his side.',
  'A savage blow on the thigh! {Def} is stunned but can still fight!',
  'Slash! Your blow lands! That one hit an artery, it could be serious!',
  'Slash! Your stroke connects! This could be serious!',
];

const HERO_STAGGER_T = [
  '{Def} is staggered, and drops to his knees.',
  "{Def} is momentarily disoriented and can't fight back.",
  'The force of your blow knocks {def} back, stunned.',
  "{Def} is confused and can't fight back.",
  'The quickness of your thrust knocks {def} back, stunned.',
];

const HERO_DISARM_T = [
  "{Def}'s weapon is knocked to the floor, leaving him unarmed.",
  '{Def} is disarmed by a subtle feint past his guard.',
];

const HERO_KILL_T = [
  "It's curtains for {def} as your sword removes his head.",
  'The fatal blow strikes {def} square in the heart: He dies.',
  '{Def} takes a fatal blow and slumps to the floor dead.',
];

/** Fills the shared HERO-MELEE line templates in with a specific villain. */
export function resolveHero(templates, defName) {
  const Def = defName.charAt(0).toUpperCase() + defName.slice(1);
  return templates.map((line) => line.replaceAll('{def}', defName).replaceAll('{Def}', Def));
}

export const HERO_MISS = (def) => resolveHero(HERO_MISS_T, def);
export const HERO_LIGHT_WOUND = (def) => resolveHero(HERO_LIGHT_WOUND_T, def);
export const HERO_SERIOUS_WOUND = (def) => resolveHero(HERO_SERIOUS_WOUND_T, def);
export const HERO_STAGGER = (def) => resolveHero(HERO_STAGGER_T, def);
export const HERO_DISARM = (def) => resolveHero(HERO_DISARM_T, def);
export const HERO_KILL = (def) => resolveHero(HERO_KILL_T, def);

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

// THIEF-MELEE (1actions.zil). The source has extra tiers for knocking the
// player unconscious and finishing them off while helpless - not modeled,
// since this engine's combat has no "unconscious" state for the player,
// same simplification already applied to the troll (losing just bounces
// you to the Cellar).
export const THIEF_MISS = [
  'The thief stabs nonchalantly with his stiletto and misses.',
  'You dodge as the thief comes in low.',
  'You parry a lightning thrust, and the thief salutes you with a grim nod.',
  'The thief tries to sneak past your guard, but you twist away.',
];

export const THIEF_LIGHT_WOUND = [
  'A quick thrust pinks your left arm, and blood starts to trickle down.',
  'The thief draws blood, raking his stiletto across your arm.',
  'The stiletto flashes faster than you can follow, and blood wells from your leg.',
  'The thief slowly approaches, strikes like a snake, and leaves you wounded.',
];

export const THIEF_SERIOUS_WOUND = [
  'The thief strikes like a snake! The resulting wound is serious.',
  'The thief stabs a deep cut in your upper arm.',
  'The stiletto touches your forehead, and the blood obscures your vision.',
  'The thief strikes at your wrist, and suddenly your grip is slippery with blood.',
];

export const THIEF_STAGGER = [
  'The butt of his stiletto cracks you on the skull, and you stagger back.',
  'The thief rams the haft of his blade into your stomach, leaving you out of breath.',
  'The thief attacks, and you fall back desperately.',
];

export const THIEF_DISARM = [
  'A long, theatrical slash. You catch it on your sword, but the thief twists his knife, and the sword goes flying.',
  'The thief neatly flips your sword out of your hands, and it drops to the floor.',
  'You parry a low thrust, and your sword slips out of your hand.',
];

export const THIEF_STRENGTH = 5;
