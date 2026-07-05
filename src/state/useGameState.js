import { useCallback, useMemo, useState } from 'react';
import { ROOMS } from '../gameData/rooms';
import { INITIAL_ITEMS } from '../gameData/items';
import {
  HERO_MISS,
  HERO_LIGHT_WOUND,
  HERO_SERIOUS_WOUND,
  HERO_STAGGER,
  HERO_DISARM,
  HERO_KILL,
  TROLL_MISS,
  TROLL_LIGHT_WOUND,
  TROLL_SERIOUS_WOUND,
  TROLL_DISARM,
  TROLL_STRENGTH,
  THIEF_MISS,
  THIEF_LIGHT_WOUND,
  THIEF_SERIOUS_WOUND,
  THIEF_DISARM,
  THIEF_STRENGTH,
  PLAYER_MAX_HEALTH,
} from '../gameData/combat';
import {
  LAMP_DIM_1,
  LAMP_DIM_2,
  LAMP_NEARLY_OUT,
  LAMP_BURNOUT,
  LAMP_DIM_1_TEXT,
  LAMP_DIM_2_TEXT,
  LAMP_NEARLY_OUT_TEXT,
  LAMP_BURNOUT_TEXT,
} from '../gameData/lamp';

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const DIRECTION_ALIASES = {
  n: 'north', north: 'north',
  s: 'south', south: 'south',
  e: 'east', east: 'east',
  w: 'west', west: 'west',
  u: 'up', up: 'up',
  d: 'down', down: 'down',
  in: 'in', enter: 'in',
  out: 'out', exit: 'out',
};

const LAMP_ON_COMMANDS = ['light lamp', 'turn on lamp', 'light the lamp'];
const LAMP_OFF_COMMANDS = ['turn off lamp', 'extinguish lamp', 'douse lamp'];

const HELP_TEXT =
  'Commands: north/south/east/west/up/down/in/out (or n/s/e/w/u/d), look, ' +
  'examine <thing>, open/close <thing>, lock/unlock <thing>, take/drop ' +
  '<thing>, put <thing> in case, read <thing>, move <thing>, attack/kill ' +
  '<thing>, inventory, score, light lamp / turn off lamp, save, restore, restart.';

function resolveRoomText(room, flags, items, currentRoom) {
  const base = typeof room.text === 'function' ? room.text(flags) : room.text;
  const floorLines = Object.values(items)
    .filter((item) => item.location === currentRoom && item.floorText)
    .map((item) => item.floorText);
  return floorLines.length > 0 ? `${base}\n${floorLines.join('\n')}` : base;
}

// Pulled out to a named constant so `restart` (JIGS-UP's third-death
// FINISH, or just typing RESTART) can reset back to it without
// duplicating the literal.
const INITIAL_FLAGS = {
  mailboxOpen: false,
  windowOpen: false,
  rugMoved: false,
  trapdoorOpen: false,
  trapdoorBarred: false,
  trollDefeated: false,
  grateRevealed: false,
  grateUnlocked: false,
  grateOpen: false,
  // Covers both CYCLOPS-FLAG and MAGIC-FLAG from the source - we only
  // implement the "say ULYSSES" solution (not the lunch/water sleep
  // path), and that one word sets both at once, so one flag suffices.
  cyclopsFled: false,
  treasureRoomVisited: false,
  ewPassageVisited: false,
  // Dam controls. gateFlag = the bubble's "greased and ready" state
  // (yellow button primes it, brown button resets it) - turning the
  // bolt only works while it's set. gatesOpen mirrors GATES-OPEN. The
  // real LOW-TIDE reservoir-draining timer and the Loud Room's ECHO/
  // platinum-bar puzzle aren't modeled - see PROJECT_STATUS.md.
  gateFlag: false,
  gatesOpen: false,
  maintenanceLightsOn: false,
  // The thief is a scoped-down "guardian" version of THIEF/I-THIEF: he
  // always sits in the Treasure Room rather than roaming the whole map
  // and stealing from other rooms (see PROJECT_STATUS.md).
  thiefDefeated: false,
};

/**
 * Central game-state hook. Mirrors the phases of the original vanilla
 * engine (GAME STATE / ROOM DICTIONARY / TRANSITION+VERB ENGINE) but as
 * React state instead of an imperative Three.js scene graph - moving
 * rooms or toggling a flag just re-renders, there's no manual
 * clear-and-rebuild step.
 */
export function useGameState() {
  const [currentRoom, setCurrentRoom] = useState('westOfHouse');
  const [inventory, setInventory] = useState([]);
  const [hasLampLit, setHasLampLit] = useState(false);
  // The battery lamp's life is finite (LAMP-TABLE) - see gameData/lamp.js.
  // lampTurnsUsed only accumulates while the lamp is actually lit.
  const [lampTurnsUsed, setLampTurnsUsed] = useState(0);
  const [lampBurnedOut, setLampBurnedOut] = useState(false);
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  // JIGS-UP: the grue-in-the-dark death. deaths counts toward the
  // source's real third-death permanent ending (gameOver); the first two
  // are a punishing-but-recoverable respawn.
  const [deaths, setDeaths] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  // V-RESTART asks "Do you wish to restart? (Y is affirmative):" before
  // wiping progress - this tracks that we're waiting on the next typed
  // command to be the yes/no answer, same targeted pattern as YES?.
  const [pendingRestartConfirm, setPendingRestartConfirm] = useState(false);
  // Combat is only relevant to the Troll Room/Treasure Room right now, so
  // this is simple top-level state rather than something threaded per-room.
  const [trollHealth, setTrollHealth] = useState(TROLL_STRENGTH);
  const [trollDisarmed, setTrollDisarmed] = useState(false);
  const [thiefHealth, setThiefHealth] = useState(THIEF_STRENGTH);
  const [thiefDisarmed, setThiefDisarmed] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(PLAYER_MAX_HEALTH);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [terminalLogs, setTerminalLogs] = useState([]);
  // baseScore accumulates one-time "first take" bonuses (a treasure's
  // VALUE, awarded once via takeItem then never again - mirrors ZIL's
  // SCORE-OBJ zeroing the property after scoring it). The trophy case's
  // contribution (TVALUE) isn't accumulated the same way - it's
  // recomputed fresh from whatever's actually in the case right now, so
  // taking a deposited treasure back out correctly removes its points
  // (mirrors TROPHY-CASE-FCN's own SETG SCORE <+ BASE-SCORE (OTVAL-FROB)>
  // rather than incrementing/decrementing by hand).
  const [baseScore, setBaseScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const room = ROOMS[currentRoom];
  // isDark: a dark room with no light source - pitch black, can't see.
  // isUnderground: a dark room WITH the lamp lit - visible, but by
  // lantern-light rather than daylight, so the viewport should look and
  // feel different even though the player can see.
  const isDark = !!room.dark && !hasLampLit;
  const isUnderground = !!room.dark && hasLampLit;
  const roomText = resolveRoomText(room, flags, items, currentRoom);

  const score = useMemo(() => {
    const caseValue = Object.values(items)
      .filter((item) => item.location === 'trophyCase')
      .reduce((sum, item) => sum + (item.tvalue || 0), 0);
    return baseScore + caseValue;
  }, [baseScore, items]);

  const log = useCallback((message) => {
    setTerminalLogs((prev) => [...prev, message]);
  }, []);

  const incrementMoves = useCallback(() => {
    setMoves((m) => m + 1);
    if (!hasLampLit || lampBurnedOut) return;
    const next = lampTurnsUsed + 1;
    setLampTurnsUsed(next);
    if (next === LAMP_DIM_1) log(LAMP_DIM_1_TEXT);
    else if (next === LAMP_DIM_2) log(LAMP_DIM_2_TEXT);
    else if (next === LAMP_NEARLY_OUT) log(LAMP_NEARLY_OUT_TEXT);
    else if (next === LAMP_BURNOUT) {
      setHasLampLit(false);
      setLampBurnedOut(true);
      log(LAMP_BURNOUT_TEXT);
    }
  }, [hasLampLit, lampBurnedOut, lampTurnsUsed, log]);

  /** Re-initializes every piece of state - no save/restore yet, so this is what `restart` does. */
  const restartGame = useCallback(() => {
    setCurrentRoom('westOfHouse');
    setInventory([]);
    setHasLampLit(false);
    setLampTurnsUsed(0);
    setLampBurnedOut(false);
    setFlags(INITIAL_FLAGS);
    setDeaths(0);
    setGameOver(false);
    setTrollHealth(TROLL_STRENGTH);
    setTrollDisarmed(false);
    setThiefHealth(THIEF_STRENGTH);
    setThiefDisarmed(false);
    setPlayerHealth(PLAYER_MAX_HEALTH);
    setItems(INITIAL_ITEMS);
    setBaseScore(0);
    setMoves(0);
    setTerminalLogs([]);
  }, []);

  /**
   * SAVE/RESTORE: the source hands this off to the Z-machine interpreter's
   * own file I/O, which has no real equivalent here - localStorage is the
   * natural browser stand-in for "a saved game position." One fixed slot
   * (matches the original's one-save-at-a-time floppy-disk-era UX), and
   * unlike `restart`, the terminal scrollback isn't cleared - RESTORE just
   * appends "Ok." and a fresh room description on top, same as it would
   * on a real terminal that never wiped its own transcript.
   */
  const saveGame = useCallback(() => {
    try {
      const snapshot = {
        version: 1,
        currentRoom,
        inventory,
        hasLampLit,
        lampTurnsUsed,
        lampBurnedOut,
        flags,
        deaths,
        gameOver,
        trollHealth,
        trollDisarmed,
        thiefHealth,
        thiefDisarmed,
        playerHealth,
        items,
        baseScore,
        moves,
      };
      window.localStorage.setItem('zork3d-save', JSON.stringify(snapshot));
      log('Ok.');
    } catch {
      log('Failed.');
    }
  }, [
    currentRoom,
    inventory,
    hasLampLit,
    lampTurnsUsed,
    lampBurnedOut,
    flags,
    deaths,
    gameOver,
    trollHealth,
    trollDisarmed,
    thiefHealth,
    thiefDisarmed,
    playerHealth,
    items,
    baseScore,
    moves,
    log,
  ]);

  const restoreGame = useCallback(() => {
    try {
      const raw = window.localStorage.getItem('zork3d-save');
      const snap = raw && JSON.parse(raw);
      if (!snap || snap.version !== 1 || !ROOMS[snap.currentRoom]) {
        log('Failed.');
        return;
      }
      setCurrentRoom(snap.currentRoom);
      setInventory(snap.inventory);
      setHasLampLit(snap.hasLampLit);
      setLampTurnsUsed(snap.lampTurnsUsed);
      setLampBurnedOut(snap.lampBurnedOut);
      setFlags(snap.flags);
      setDeaths(snap.deaths);
      setGameOver(snap.gameOver);
      setTrollHealth(snap.trollHealth);
      setTrollDisarmed(snap.trollDisarmed);
      setThiefHealth(snap.thiefHealth);
      setThiefDisarmed(snap.thiefDisarmed);
      setPlayerHealth(snap.playerHealth);
      setItems(snap.items);
      setBaseScore(snap.baseScore);
      setMoves(snap.moves);

      log('Ok.');
      const restoredRoom = ROOMS[snap.currentRoom];
      const restoredIsDark = !!restoredRoom.dark && !snap.hasLampLit;
      log(
        restoredIsDark
          ? 'It is pitch black. You are likely to be eaten by a grue.'
          : resolveRoomText(restoredRoom, snap.flags, snap.items, snap.currentRoom)
      );
    } catch {
      log('Failed.');
    }
  }, [log]);

  /**
   * JIGS-UP, scoped to its actual trigger in this game (see moveRoom's
   * grue check): -10 score, the "You have died" banner, then either a
   * punishing respawn (deaths 1-2) or the source's real permanent ending
   * (death 3). RANDOMIZE-OBJECTS is simplified to two pools (treasures
   * scatter to a random dark room, everything else to a random surface
   * room) rather than the source's visited/unvisited room-history logic.
   */
  const handleDeath = useCallback(
    (deathMessage) => {
      log(deathMessage);
      log('Bad luck, huh?');
      log('****  You have died  ****');
      setBaseScore((s) => s - 10);

      const nextDeaths = deaths + 1;
      setDeaths(nextDeaths);
      if (nextDeaths >= 3) {
        log(
          "You clearly are a suicidal maniac. We don't allow psychotics in the cave, since they may harm other adventurers. Your remains will be installed in the Land of the Living Dead, where your fellow adventurers may gloat over them."
        );
        log('Type RESTART or RESTORE to continue.');
        setGameOver(true);
        return;
      }

      log(
        "Now, let's take a look here...\nWell, you probably deserve another chance. I can't quite fix you up completely, but you can't have everything."
      );

      const darkRoomIds = Object.values(ROOMS).filter((r) => r.dark).map((r) => r.id);
      const surfaceRoomIds = Object.values(ROOMS)
        .filter((r) => r.environment === 'surface')
        .map((r) => r.id);
      setItems((prev) => {
        const next = { ...prev };
        for (const id of inventory) {
          const isTreasure = !!(next[id].value || next[id].tvalue);
          const pool = isTreasure ? darkRoomIds : surfaceRoomIds;
          next[id] = { ...next[id], location: pool[Math.floor(Math.random() * pool.length)] };
        }
        return next;
      });
      setInventory([]);
      setHasLampLit(false);
      setFlags((prev) => ({ ...prev, trapdoorBarred: false }));
      setCurrentRoom('forest1');
    },
    [deaths, inventory, log]
  );

  const isItemReachable = useCallback(
    (item) => {
      if (item.location === 'inventory') return true;
      if (item.location === currentRoom) return true;
      if (item.location === 'mailbox') {
        return currentRoom === 'westOfHouse' && flags.mailboxOpen;
      }
      if (item.location === 'trophyCase') {
        return currentRoom === 'livingRoom';
      }
      return false;
    },
    [currentRoom, flags.mailboxOpen]
  );

  const findItemByName = useCallback(
    (name) => Object.values(items).find((item) => item.name === name),
    [items]
  );

  const describeMailbox = useCallback(() => {
    if (!flags.mailboxOpen) return 'The small mailbox is closed.';
    return items.leaflet.location === 'mailbox'
      ? 'The small mailbox is open. Inside is a leaflet.'
      : 'The small mailbox is open and empty.';
  }, [flags.mailboxOpen, items]);

  const moveRoom = useCallback(
    (direction) => {
      if (gameOver) {
        log('Type RESTART or RESTORE to continue.');
        return;
      }
      incrementMoves();
      const targetId = room.exits[direction];
      if (!targetId) {
        const blockedEntry = room.blockedExits && room.blockedExits[direction];
        const blockedMessage = typeof blockedEntry === 'function' ? blockedEntry(flags) : blockedEntry;
        // Only a genuinely undefined direction (no exit, no blocked-exit
        // flavor text) risks the grue - matches V-WALK's fallthrough case
        // in the source, not a blanket "acting in the dark is dangerous."
        if (!blockedMessage && isDark && Math.random() < 0.8) {
          handleDeath('Oh, no! You have walked into the slavering fangs of a lurking grue!');
          return;
        }
        log(blockedMessage || "You can't go that way.");
        return;
      }
      // A guard's return value is a discriminated union: a string blocks
      // the move and is shown as the reason; an object (or null/undefined)
      // allows it, and if the object has flagUpdates they're applied as a
      // side effect of a *successful* move (the up-chimney puzzle needs
      // this: climbing out with the lamp and at most one other item
      // succeeds, which also resets the barred trap door). A `message`
      // logs *before* the move completes - the maze's one-way "diode"
      // passages warn you can't come back this way before you commit to it.
      const guard = room.exitGuards && room.exitGuards[direction];
      const guardResult = guard && guard(flags, inventory);
      if (typeof guardResult === 'string') {
        log(guardResult);
        return;
      }
      if (guardResult && guardResult.message) {
        log(guardResult.message);
      }

      setCurrentRoom(targetId);

      if (guardResult && guardResult.flagUpdates) {
        setFlags((prev) => ({ ...prev, ...guardResult.flagUpdates }));
      }

      const targetRoom = ROOMS[targetId];
      const enterResult = targetRoom.onEnter && targetRoom.onEnter(flags);
      if (enterResult) {
        if (enterResult.flagUpdates) {
          setFlags((prev) => ({ ...prev, ...enterResult.flagUpdates }));
        }
        if (enterResult.message) {
          log(enterResult.message);
        }
        // Some rooms carry their own one-time discovery bonus in the
        // source (e.g. the Treasure Room's own VALUE 25) rather than an
        // item's - scored the same way an item's first-take bonus is.
        if (enterResult.scoreBonus) {
          setBaseScore((s) => s + enterResult.scoreBonus);
        }
      }

      // Environment switch: underground + no lantern lit is pitch black,
      // regardless of any onEnter message above (e.g. the Cellar's trap
      // door can slam shut *and* leave you blind in the same move).
      if (targetRoom.environment === 'underground' && targetRoom.dark && !hasLampLit) {
        log('It is pitch black. You are likely to be eaten by a grue.');
      }
    },
    [room, flags, inventory, hasLampLit, isDark, log, incrementMoves, handleDeath, gameOver]
  );

  const openObject = useCallback(
    (noun) => {
      if (noun === 'mailbox') {
        if (currentRoom !== 'westOfHouse') {
          log("You don't see a mailbox here.");
        } else if (flags.mailboxOpen) {
          log('It is already open.');
        } else {
          setFlags((prev) => ({ ...prev, mailboxOpen: true }));
          log('Opening the small mailbox reveals a leaflet.');
        }
        return;
      }
      if (noun === 'window') {
        if (currentRoom !== 'behindHouse') {
          log("You don't see a window here.");
        } else if (flags.windowOpen) {
          log('It is already open.');
        } else {
          setFlags((prev) => ({ ...prev, windowOpen: true }));
          log('With great effort, you open the window far enough to allow entry.');
        }
        return;
      }
      if (noun === 'trap door' || noun === 'trapdoor') {
        if (currentRoom === 'livingRoom' && flags.rugMoved) {
          if (flags.trapdoorOpen) {
            log('It is already open.');
          } else {
            setFlags((prev) => ({ ...prev, trapdoorOpen: true }));
            log('The door reluctantly opens to reveal a rickety staircase descending into darkness.');
          }
        } else if (currentRoom === 'cellar') {
          log('The door is locked from above.');
        } else {
          log("You don't see that here.");
        }
        return;
      }
      if (noun === 'grate' || noun === 'grating') {
        if (currentRoom !== 'gratingClearing' && currentRoom !== 'gratingRoom') {
          log("You don't see that here.");
        } else if (!flags.grateUnlocked) {
          log('The grating is locked.');
        } else if (flags.grateOpen) {
          log('It is already open.');
        } else {
          const updates = { grateOpen: true };
          // Opening from either side reveals it on the other too -
          // mirrors GRATE-FUNCTION's own leaf-drop when opened from
          // below before the surface leaves were ever disturbed. The
          // leaves themselves fall through to wherever the player
          // currently is (MOVE LEAVES HERE in the source).
          if (!flags.grateRevealed) {
            updates.grateRevealed = true;
            log('A pile of leaves falls onto your head and to the ground.');
            if (items.leaves.location === 'gratingClearing') {
              setItems((prev) => ({ ...prev, leaves: { ...prev.leaves, location: currentRoom } }));
            }
          }
          setFlags((prev) => ({ ...prev, ...updates }));
          log(
            currentRoom === 'gratingRoom'
              ? 'The grating opens to reveal trees above you.'
              : 'The grating opens.'
          );
        }
        return;
      }
      if (noun === 'dam' || noun === 'gate' || noun === 'gates') {
        if (currentRoom !== 'damRoom') {
          log("You don't see that here.");
        } else {
          log("Sounds reasonable, but this isn't how.");
        }
        return;
      }
      log("You can't open that.");
    },
    [currentRoom, flags, items, log]
  );

  const closeObject = useCallback(
    (noun) => {
      if (noun === 'mailbox') {
        if (currentRoom !== 'westOfHouse') {
          log("You don't see a mailbox here.");
        } else if (!flags.mailboxOpen) {
          log('It is already closed.');
        } else {
          setFlags((prev) => ({ ...prev, mailboxOpen: false }));
          log('Closed.');
        }
        return;
      }
      if (noun === 'window') {
        if (currentRoom !== 'behindHouse') {
          log("You don't see a window here.");
        } else if (!flags.windowOpen) {
          log('It is already closed.');
        } else {
          setFlags((prev) => ({ ...prev, windowOpen: false }));
          log('The window closes (more easily than it opened).');
        }
        return;
      }
      if (noun === 'trap door' || noun === 'trapdoor') {
        if (currentRoom === 'livingRoom' && flags.rugMoved) {
          if (!flags.trapdoorOpen) {
            log('It is already closed.');
          } else {
            setFlags((prev) => ({ ...prev, trapdoorOpen: false }));
            log('The door swings shut and closes.');
          }
        } else if (currentRoom === 'cellar') {
          log('The door closes and locks.');
        } else {
          log("You don't see that here.");
        }
        return;
      }
      if (noun === 'grate' || noun === 'grating') {
        if (currentRoom !== 'gratingClearing' && currentRoom !== 'gratingRoom') {
          log("You don't see that here.");
        } else if (!flags.grateOpen) {
          log('It is already closed.');
        } else {
          setFlags((prev) => ({ ...prev, grateOpen: false }));
          log('The grating is closed.');
        }
        return;
      }
      if (noun === 'dam' || noun === 'gate' || noun === 'gates') {
        if (currentRoom !== 'damRoom') {
          log("You don't see that here.");
        } else {
          log("Sounds reasonable, but this isn't how.");
        }
        return;
      }
      log("You can't close that.");
    },
    [currentRoom, flags, log]
  );

  const takeItem = useCallback(
    (noun) => {
      if (noun === 'mailbox') {
        log('It is securely anchored.');
        return;
      }
      if (noun === 'rug' || noun === 'carpet') {
        if (currentRoom === 'livingRoom') {
          log('The rug is extremely heavy and cannot be carried.');
        } else {
          log("You can't see that here.");
        }
        return;
      }
      if (noun === 'trophy case' || noun === 'case') {
        if (currentRoom === 'livingRoom') {
          log('The trophy case is securely fastened to the wall.');
        } else {
          log("You can't see that here.");
        }
        return;
      }
      if (noun === 'troll') {
        if (currentRoom === 'trollRoom') {
          log("You can't take the troll with you.");
        } else {
          log("You can't see that here.");
        }
        return;
      }
      if (noun === 'thief') {
        if (currentRoom === 'treasureRoom') {
          log('Once you got him, what would you do with him?');
        } else {
          log("You can't see that here.");
        }
        return;
      }
      // CHALICE-FCN: the thief defends his hoard until defeated.
      if (noun === 'chalice' && currentRoom === 'treasureRoom' && !flags.thiefDefeated) {
        log("You'd be stabbed in the back first.");
        return;
      }
      const item = findItemByName(noun);
      if (!item || !isItemReachable(item)) {
        log("You can't see that here.");
        return;
      }
      if (item.location === 'inventory') {
        log('You already have that.');
        return;
      }
      if (!item.portable) {
        log("You can't take that.");
        return;
      }
      // A treasure's one-time "first take" bonus (mirrors SCORE-OBJ
      // zeroing VALUE after it's scored once - valueScored is our
      // equivalent of that zeroing, so picking it up again later, e.g.
      // after dropping it, doesn't pay out twice).
      if (item.value && !item.valueScored) {
        setBaseScore((s) => s + item.value);
      }
      setItems((prev) => ({
        ...prev,
        [item.id]: {
          ...prev[item.id],
          location: 'inventory',
          valueScored: prev[item.id].valueScored || !!item.value,
        },
      }));
      setInventory((prev) => [...prev, item.id]);
      // Taking the leaves also reveals the grate underneath, same as
      // moving them (LEAVES-APPEAR fires for either verb in the source).
      if (item.id === 'leaves' && !flags.grateRevealed) {
        setFlags((prev) => ({ ...prev, grateRevealed: true }));
        log('In disturbing the pile of leaves, a grating is revealed.');
      }
      log('Taken.');
    },
    [currentRoom, findItemByName, isItemReachable, flags.grateRevealed, flags.thiefDefeated, log]
  );

  const dropItem = useCallback(
    (noun) => {
      const item = findItemByName(noun);
      if (!item || item.location !== 'inventory') {
        log("You're not carrying that.");
        return;
      }
      setItems((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], location: currentRoom },
      }));
      setInventory((prev) => prev.filter((id) => id !== item.id));
      // Dropping the lit lamp leaves it behind - you no longer have
      // portable light with you (the room you left it in staying lit is
      // a real Zork mechanic, but out of scope here).
      if (item.isLightSource && hasLampLit) {
        setHasLampLit(false);
      }
      log('Dropped.');
    },
    [findItemByName, currentRoom, hasLampLit, log]
  );

  /**
   * "put <item> in <container>" - the trophy case is the only real
   * container a player deposits things into, so that's all this
   * supports for now rather than a generic container system.
   */
  const putItem = useCallback(
    (noun, containerNoun) => {
      const item = findItemByName(noun);
      if (!item || item.location !== 'inventory') {
        log("You don't have that.");
        return;
      }
      if (containerNoun !== 'case' && containerNoun !== 'trophy case') {
        log("You can't put that there.");
        return;
      }
      if (currentRoom !== 'livingRoom') {
        log("You don't see that here.");
        return;
      }
      setItems((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], location: 'trophyCase' },
      }));
      setInventory((prev) => prev.filter((id) => id !== item.id));
      log('Done.');
    },
    [findItemByName, currentRoom, log]
  );

  /** "move"/"push" the rug, revealing the trap door underneath - one-shot. */
  const moveObject = useCallback(
    (noun) => {
      if (noun === 'rug' || noun === 'carpet') {
        if (currentRoom !== 'livingRoom') {
          log("You don't see that here.");
        } else if (flags.rugMoved) {
          log('Having moved the carpet previously, you find it impossible to move it again.');
        } else {
          setFlags((prev) => ({ ...prev, rugMoved: true }));
          log('With a great effort, the rug is moved to one side of the room, revealing the dusty cover of a closed trap door.');
        }
        return;
      }
      if (noun === 'leaves' || noun === 'leaf' || noun === 'pile') {
        if (currentRoom !== 'gratingClearing') {
          log("You don't see that here.");
        } else if (flags.grateRevealed) {
          log('Done.');
        } else {
          setFlags((prev) => ({ ...prev, grateRevealed: true }));
          log('With the leaves moved, a grating is revealed.');
        }
        return;
      }
      log("You can't move that.");
    },
    [currentRoom, flags.rugMoved, flags.grateRevealed, log]
  );

  /**
   * One player attack = one hero blow, then (if the troll survives,
   * isn't staggered, and isn't disarmed) one troll counter-blow in the
   * same turn - mirrors how a single "kill troll with sword" command
   * resolves both sides of the exchange in the original. Message text
   * is verbatim from the source's HERO-MELEE/TROLL-MELEE tables; the
   * odds themselves are a simplified stand-in (see combat.js).
   */
  const attackTroll = useCallback(() => {
    if (currentRoom !== 'trollRoom') {
      log("You don't see that here.");
      return;
    }
    if (flags.trollDefeated) {
      log("There's nothing here to fight.");
      return;
    }

    const hasSword = inventory.includes('sword');
    const roll = Math.random();

    if (!hasSword) {
      // Bare-handed: mostly misses, and even a "hit" is too weak to
      // matter - the game keeps nudging you toward finding the sword.
      if (roll < 0.7) {
        log(randomPick(HERO_MISS('the troll')));
      } else {
        log(randomPick(HERO_LIGHT_WOUND('the troll')));
      }
      return counterBlow(true);
    }

    if (roll < 0.25) {
      log(randomPick(HERO_MISS('the troll')));
      return counterBlow(true);
    }
    if (roll < 0.35 && !trollDisarmed) {
      log(randomPick(HERO_DISARM('the troll')));
      setTrollDisarmed(true);
      return counterBlow(false);
    }
    if (roll < 0.45) {
      log(randomPick(HERO_STAGGER('the troll')));
      return counterBlow(false);
    }

    const damage = roll < 0.6 ? 2 : 1;
    const nextHealth = trollHealth - damage;
    log(randomPick(damage === 2 ? HERO_SERIOUS_WOUND('the troll') : HERO_LIGHT_WOUND('the troll')));

    if (nextHealth <= 0) {
      log(randomPick(HERO_KILL('the troll')));
      setFlags((prev) => ({ ...prev, trollDefeated: true }));
      setTrollHealth(0);
      return;
    }
    setTrollHealth(nextHealth);
    counterBlow(true);

    function counterBlow(canCounter) {
      if (!canCounter || trollDisarmed) return;
      const villainRoll = Math.random();
      if (villainRoll < 0.2) {
        log(randomPick(TROLL_MISS));
        return;
      }
      if (villainRoll < 0.3 && hasSword) {
        log(randomPick(TROLL_DISARM));
        setItems((prev) => ({ ...prev, sword: { ...prev.sword, location: 'trollRoom' } }));
        setInventory((prev) => prev.filter((id) => id !== 'sword'));
        return;
      }
      const villainDamage = villainRoll < 0.45 ? 2 : 1;
      log(randomPick(villainDamage === 2 ? TROLL_SERIOUS_WOUND : TROLL_LIGHT_WOUND));
      const nextPlayerHealth = playerHealth - villainDamage;
      if (nextPlayerHealth <= 0) {
        log('Badly wounded, you stagger back through the passage to the safety of the Cellar.');
        setPlayerHealth(PLAYER_MAX_HEALTH);
        // Goes through the normal south exit rather than a raw state
        // set, so the Cellar's usual onEnter/pitch-black handling still
        // applies exactly as if the player had walked there themselves.
        moveRoom('south');
      } else {
        setPlayerHealth(nextPlayerHealth);
      }
    }
  }, [currentRoom, flags.trollDefeated, inventory, trollHealth, trollDisarmed, playerHealth, log, moveRoom]);

  /**
   * Same shape as attackTroll (one hero blow, then one thief counter-blow),
   * just against the Treasure Room's guardian instead. The thief's higher
   * STRENGTH (5 vs. the troll's 2) makes him a tougher fight, matching the
   * source. Message text is verbatim from HERO-MELEE/THIEF-MELEE; the odds
   * are the same simplified stand-in used for the troll (see combat.js).
   * The source's roaming/stealing/egg-safety mechanics aren't modeled -
   * this is a stationary guardian encounter only (see PROJECT_STATUS.md).
   */
  const attackThief = useCallback(() => {
    if (currentRoom !== 'treasureRoom') {
      log("You don't see that here.");
      return;
    }
    if (flags.thiefDefeated) {
      log("There's nothing here to fight.");
      return;
    }

    const hasSword = inventory.includes('sword');
    const roll = Math.random();

    if (!hasSword) {
      if (roll < 0.7) {
        log(randomPick(HERO_MISS('the thief')));
      } else {
        log(randomPick(HERO_LIGHT_WOUND('the thief')));
      }
      return counterBlow(true);
    }

    if (roll < 0.25) {
      log(randomPick(HERO_MISS('the thief')));
      return counterBlow(true);
    }
    if (roll < 0.35 && !thiefDisarmed) {
      log(randomPick(HERO_DISARM('the thief')));
      setThiefDisarmed(true);
      return counterBlow(false);
    }
    if (roll < 0.45) {
      log(randomPick(HERO_STAGGER('the thief')));
      return counterBlow(false);
    }

    const damage = roll < 0.6 ? 2 : 1;
    const nextHealth = thiefHealth - damage;
    log(randomPick(damage === 2 ? HERO_SERIOUS_WOUND('the thief') : HERO_LIGHT_WOUND('the thief')));

    if (nextHealth <= 0) {
      log(randomPick(HERO_KILL('the thief')));
      setFlags((prev) => ({ ...prev, thiefDefeated: true }));
      setThiefHealth(0);
      return;
    }
    setThiefHealth(nextHealth);
    counterBlow(true);

    function counterBlow(canCounter) {
      if (!canCounter || thiefDisarmed) return;
      const villainRoll = Math.random();
      if (villainRoll < 0.2) {
        log(randomPick(THIEF_MISS));
        return;
      }
      if (villainRoll < 0.3 && hasSword) {
        log(randomPick(THIEF_DISARM));
        setItems((prev) => ({ ...prev, sword: { ...prev.sword, location: 'treasureRoom' } }));
        setInventory((prev) => prev.filter((id) => id !== 'sword'));
        return;
      }
      const villainDamage = villainRoll < 0.45 ? 2 : 1;
      log(randomPick(villainDamage === 2 ? THIEF_SERIOUS_WOUND : THIEF_LIGHT_WOUND));
      const nextPlayerHealth = playerHealth - villainDamage;
      if (nextPlayerHealth <= 0) {
        log('Badly wounded, you stagger back down the staircase to the safety of the Cyclops Room.');
        setPlayerHealth(PLAYER_MAX_HEALTH);
        moveRoom('down');
      } else {
        setPlayerHealth(nextPlayerHealth);
      }
    }
  }, [currentRoom, flags.thiefDefeated, inventory, thiefHealth, thiefDisarmed, playerHealth, log, moveRoom]);

  /**
   * The grate can only be unlocked/locked from the Grating Room side
   * with the skeleton key from Maze-5 - matches GRATE-FUNCTION exactly,
   * including the distinct "can't reach/lock from here" messages when
   * tried from the Grating Clearing side above.
   */
  const unlockGrate = useCallback(() => {
    if (currentRoom !== 'gratingRoom' && currentRoom !== 'gratingClearing') {
      log("You don't see that here.");
      return;
    }
    if (currentRoom === 'gratingClearing') {
      log("You can't reach the lock from here.");
      return;
    }
    if (!inventory.includes('keys')) {
      log("You don't have the skeleton key.");
      return;
    }
    if (flags.grateUnlocked) {
      log('It is already unlocked.');
      return;
    }
    setFlags((prev) => ({ ...prev, grateUnlocked: true }));
    log('The grate is unlocked.');
  }, [currentRoom, inventory, flags.grateUnlocked, log]);

  const lockGrate = useCallback(() => {
    if (currentRoom !== 'gratingRoom' && currentRoom !== 'gratingClearing') {
      log("You don't see that here.");
      return;
    }
    if (currentRoom === 'gratingClearing') {
      log("You can't lock it from this side.");
      return;
    }
    setFlags((prev) => ({ ...prev, grateUnlocked: false }));
    log('The grate is locked.');
  }, [currentRoom, log]);

  /**
   * "ULYSSES"/"ODYSSEUS" is its own standalone command in the source
   * (V-ODYSSEUS), not "say X" - matches its exact fallback line and the
   * flee message verbatim. Only the word puzzle is modeled; the
   * alternate lunch/water sleep solution isn't (see PROJECT_STATUS.md).
   */
  const sayUlysses = useCallback(() => {
    if (currentRoom !== 'cyclopsRoom' || flags.cyclopsFled) {
      log("Wasn't he a sailor?");
      return;
    }
    setFlags((prev) => ({ ...prev, cyclopsFled: true }));
    log(
      "The cyclops, hearing the name of his father's deadly nemesis, flees " +
        'the room by knocking down the wall on the east of the room.'
    );
  }, [currentRoom, flags.cyclopsFled, log]);

  /** Turning the bolt only works primed (gateFlag, via the yellow/brown
   * buttons in the Maintenance Room) and with the wrench - matches
   * BOLT-F's exact messages for both failure cases. */
  const turnBolt = useCallback(() => {
    if (currentRoom !== 'damRoom') {
      log("You don't see that here.");
      return;
    }
    if (!inventory.includes('wrench')) {
      log("The bolt won't turn using your bare hands.");
      return;
    }
    if (!flags.gateFlag) {
      log("The bolt won't turn with your best effort.");
      return;
    }
    setFlags((prev) => ({ ...prev, gatesOpen: !prev.gatesOpen }));
    log(
      flags.gatesOpen
        ? 'The sluice gates close and water starts to collect behind the dam.'
        : 'The sluice gates open and water pours through the dam.'
    );
  }, [currentRoom, inventory, flags.gateFlag, flags.gatesOpen, log]);

  /**
   * Yellow/brown "arm"/"disarm" the bolt (GATE-FLAG); red is a flavor-only
   * light toggle for this one room (not wired into the isDark/lantern
   * engine - see PROJECT_STATUS.md); blue's real leak/repair puzzle isn't
   * modeled, so it's permanently "jammed" rather than half-implemented.
   */
  const pushButton = useCallback(
    (noun) => {
      if (currentRoom !== 'maintenanceRoom') {
        log("You don't see that here.");
        return;
      }
      if (noun.includes('yellow')) {
        setFlags((prev) => ({ ...prev, gateFlag: true }));
        log('Click.');
      } else if (noun.includes('brown')) {
        setFlags((prev) => ({ ...prev, gateFlag: false }));
        log('Click.');
      } else if (noun.includes('red')) {
        setFlags((prev) => ({ ...prev, maintenanceLightsOn: !prev.maintenanceLightsOn }));
        log(`The lights within the room ${flags.maintenanceLightsOn ? 'shut off.' : 'come on.'}`);
      } else if (noun.includes('blue')) {
        log('The blue button appears to be jammed.');
      } else {
        log("You can't push that.");
      }
    },
    [currentRoom, flags.maintenanceLightsOn, log]
  );

  const examineObject = useCallback(
    (noun) => {
      if (noun === 'mailbox') {
        if (currentRoom !== 'westOfHouse') {
          log("You don't see a mailbox here.");
        } else {
          log(describeMailbox());
        }
        return;
      }
      if (noun === 'window') {
        if (currentRoom !== 'behindHouse') {
          log("You don't see a window here.");
        } else {
          log(
            flags.windowOpen
              ? 'The window is open.'
              : 'The window is slightly ajar, but not enough to allow entry.'
          );
        }
        return;
      }
      if (noun === 'grate' || noun === 'grating') {
        if (
          (currentRoom !== 'gratingClearing' && currentRoom !== 'gratingRoom') ||
          !flags.grateRevealed
        ) {
          log("You don't see that here.");
        } else if (flags.grateOpen) {
          log('The grating is open.');
        } else if (flags.grateUnlocked) {
          log('The grating is closed but unlocked.');
        } else {
          log('The grating is locked with a skull-and-crossbones lock.');
        }
        return;
      }
      if (noun === 'table') {
        if (currentRoom === 'kitchen') {
          log('A table seems to have been used recently for the preparation of food.');
        } else if (currentRoom === 'attic') {
          log("There's nothing special about the table.");
        } else {
          log("You don't see that here.");
        }
        return;
      }
      if (noun === 'rug' || noun === 'carpet') {
        if (currentRoom !== 'livingRoom') {
          log("You don't see that here.");
        } else if (flags.rugMoved) {
          log('The rug has been moved to one side of the room.');
        } else {
          log('A large oriental rug, covering most of the floor.');
        }
        return;
      }
      if (noun === 'trophy case' || noun === 'case') {
        if (currentRoom !== 'livingRoom') {
          log("You don't see that here.");
          return;
        }
        const deposited = Object.values(items).filter((i) => i.location === 'trophyCase');
        log(
          deposited.length === 0
            ? 'The trophy case is empty.'
            : `The trophy case contains: ${deposited.map((i) => i.name).join(', ')}.`
        );
        return;
      }
      if (noun === 'trap door' || noun === 'trapdoor') {
        if (currentRoom === 'livingRoom' && flags.rugMoved) {
          log(
            flags.trapdoorOpen
              ? 'The open trap door reveals a rickety staircase descending into darkness.'
              : 'A closed trap door is set into the floor.'
          );
        } else {
          log("You don't see that here.");
        }
        return;
      }
      if (noun === 'troll') {
        if (currentRoom === 'trollRoom') {
          log('A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.');
        } else {
          log("You don't see that here.");
        }
        return;
      }
      if (noun === 'lamp' || noun === 'lantern') {
        if (!isItemReachable(items.lamp)) {
          log("You don't see that here.");
        } else if (lampBurnedOut) {
          log('The lamp has burned out.');
        } else {
          log(`The lamp is ${hasLampLit ? 'on' : 'turned off'}.`);
        }
        return;
      }
      if (noun === 'thief' || noun === 'robber' || noun === 'man' || noun === 'person') {
        if (currentRoom === 'treasureRoom' && !flags.thiefDefeated) {
          log(
            'The thief is a slippery character with beady eyes that flit back and forth. He carries, along with an unmistakable arrogance, a large bag over his shoulder and a vicious stiletto, whose blade is aimed menacingly in your direction. I\'d watch out if I were you.'
          );
        } else {
          log("You don't see that here.");
        }
        return;
      }
      const item = findItemByName(noun);
      if (item && isItemReachable(item)) {
        log(item.description);
        return;
      }
      log("You don't see that here.");
    },
    [
      currentRoom,
      flags.windowOpen,
      flags.rugMoved,
      flags.trapdoorOpen,
      flags.grateRevealed,
      flags.grateOpen,
      flags.grateUnlocked,
      flags.thiefDefeated,
      lampBurnedOut,
      hasLampLit,
      describeMailbox,
      findItemByName,
      isItemReachable,
      items,
      log,
    ]
  );

  const readItem = useCallback(
    (noun) => {
      const item = findItemByName(noun);
      if (!item || !isItemReachable(item)) {
        log("You don't see that here.");
        return;
      }
      log(item.readText || "There's nothing written on it.");
    },
    [findItemByName, isItemReachable, log]
  );

  const showInventory = useCallback(() => {
    if (inventory.length === 0) {
      log('You are empty-handed.');
      return;
    }
    const names = inventory.map((id) => items[id].name).join(', ');
    log(`You are carrying: ${names}.`);
  }, [inventory, items, log]);

  const lookAround = useCallback(() => {
    log(roomText);
  }, [roomText, log]);

  /** Verbatim V-SCORE text/thresholds - 350 is the real Zork I max. */
  const showScore = useCallback(() => {
    let rank;
    if (score === 350) rank = 'Master Adventurer';
    else if (score > 330) rank = 'Wizard';
    else if (score > 300) rank = 'Master';
    else if (score > 200) rank = 'Adventurer';
    else if (score > 100) rank = 'Junior Adventurer';
    else if (score > 50) rank = 'Novice Adventurer';
    else if (score > 25) rank = 'Amateur Adventurer';
    else rank = 'Beginner';

    log(
      `Your score is ${score} (total of 350 points), in ${moves} move${moves === 1 ? '' : 's'}.\n` +
        `This gives you the rank of ${rank}.`
    );
  }, [score, moves, log]);

  const setLampLit = useCallback(
    (lit) => {
      // Deliberately stricter than "reachable" (room-or-inventory): our
      // isDark/isUnderground check is a global hasLampLit boolean that
      // travels with the player, not tied to the lamp's actual location.
      // If turning it on merely required being in the same room, lighting
      // it and walking away would leave the player "carrying" light they
      // in fact left behind on the trophy case.
      if (lit && items.lamp.location !== 'inventory') {
        log("You don't have a lamp.");
        return;
      }
      if (lampBurnedOut) {
        log(lit ? "A burned-out lamp won't light." : 'The lamp has already burned out.');
        return;
      }
      setHasLampLit(lit);
      log(lit ? 'The lamp is now on.' : 'The lamp is now off.');
    },
    [items.lamp, lampBurnedOut, log]
  );

  /** Generic dispatcher matching the requested hook shape. */
  const interactWithObject = useCallback(
    (objectName, action) => {
      if (gameOver) {
        log('Type RESTART or RESTORE to continue.');
        return;
      }
      incrementMoves();
      switch (action) {
        case 'open': openObject(objectName); break;
        case 'close': closeObject(objectName); break;
        case 'take': takeItem(objectName); break;
        case 'drop': dropItem(objectName); break;
        case 'move': moveObject(objectName); break;
        case 'examine': examineObject(objectName); break;
        case 'read': readItem(objectName); break;
        case 'attack': (objectName === 'thief' ? attackThief : attackTroll)(); break;
        case 'unlock': unlockGrate(); break;
        case 'lock': lockGrate(); break;
        case 'turn': turnBolt(); break;
        case 'push': pushButton(objectName); break;
        default: log('Nothing happens.');
      }
    },
    [
      openObject,
      closeObject,
      takeItem,
      dropItem,
      moveObject,
      examineObject,
      readItem,
      attackTroll,
      attackThief,
      unlockGrate,
      lockGrate,
      turnBolt,
      pushButton,
      log,
      incrementMoves,
      gameOver,
    ]
  );

  /** Parses a free-text command line, same verb set as the vanilla engine. */
  const runCommand = useCallback(
    (raw) => {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;

      if (pendingRestartConfirm) {
        setPendingRestartConfirm(false);
        if (cmd === 'y' || cmd === 'yes') {
          log('Restarting.');
          restartGame();
        } else {
          log('Ok.');
        }
        return;
      }
      if (cmd === 'restart') {
        if (gameOver) {
          restartGame();
        } else {
          setPendingRestartConfirm(true);
          log('Do you wish to restart? (Y is affirmative): ');
        }
        return;
      }
      if (cmd === 'restore') {
        restoreGame();
        return;
      }
      if (gameOver) {
        log('Type RESTART or RESTORE to continue.');
        return;
      }
      if (cmd === 'save') {
        saveGame();
        return;
      }

      if (DIRECTION_ALIASES[cmd]) {
        moveRoom(DIRECTION_ALIASES[cmd]);
        return;
      }
      if (cmd === 'look') {
        lookAround();
        return;
      }
      if (cmd === 'inventory' || cmd === 'i' || cmd === 'inv') {
        showInventory();
        return;
      }
      if (cmd === 'help') {
        log(HELP_TEXT);
        return;
      }
      if (cmd === 'score') {
        showScore();
        return;
      }
      if (cmd === 'ulysses' || cmd === 'odysseus') {
        incrementMoves();
        sayUlysses();
        return;
      }
      if (LAMP_ON_COMMANDS.includes(cmd)) {
        incrementMoves();
        setLampLit(true);
        return;
      }
      if (LAMP_OFF_COMMANDS.includes(cmd)) {
        incrementMoves();
        setLampLit(false);
        return;
      }

      const words = cmd.split(/\s+/);
      const verb = words[0];
      const skipAt = verb === 'look' && words[1] === 'at' ? 2 : 1;
      const noun = words.slice(skipAt).join(' ').replace(/^the\s+/, '').trim();

      // 'enter'/'leave' go through moveRoom, which already counts its own
      // turn - every other branch here counts one of its own so the two
      // paths don't double up on a single command.
      switch (verb) {
        case 'enter': moveRoom('in'); break;
        case 'leave': moveRoom('out'); break;
        case 'open': incrementMoves(); openObject(noun); break;
        case 'close': incrementMoves(); closeObject(noun); break;
        case 'take':
        case 'get': incrementMoves(); takeItem(noun); break;
        case 'drop': incrementMoves(); dropItem(noun); break;
        case 'put': {
          incrementMoves();
          const match = noun.match(/^(.*?)\s+(?:in|on)\s+(.*)$/);
          if (!match) {
            log('Put it where?');
            break;
          }
          putItem(match[1].trim(), match[2].trim().replace(/^the\s+/, ''));
          break;
        }
        case 'move':
        case 'raise': incrementMoves(); moveObject(noun); break;
        case 'push':
          incrementMoves();
          if (noun.includes('button')) {
            pushButton(noun);
          } else {
            moveObject(noun);
          }
          break;
        case 'turn': incrementMoves(); turnBolt(); break;
        case 'examine':
        case 'x':
        case 'look': incrementMoves(); examineObject(noun); break;
        case 'read': incrementMoves(); readItem(noun); break;
        case 'attack':
        case 'kill':
        case 'hit':
        case 'fight': {
          incrementMoves();
          const target = noun.replace(/\s+with\s+.*$/, '').trim();
          const isThiefTarget = ['thief', 'robber', 'man', 'person'].includes(target);
          if (!target) {
            (currentRoom === 'treasureRoom' ? attackThief : attackTroll)();
          } else if (target === 'troll') {
            attackTroll();
          } else if (isThiefTarget) {
            attackThief();
          } else if (target === 'cyclops' && currentRoom === 'cyclopsRoom' && !flags.cyclopsFled) {
            log('The cyclops shrugs but otherwise ignores your pitiful attempt.');
          } else {
            log("You can't attack that.");
          }
          break;
        }
        case 'unlock': incrementMoves(); unlockGrate(); break;
        case 'lock': incrementMoves(); lockGrate(); break;
        default: log("I don't understand that command.");
      }
    },
    [
      moveRoom,
      lookAround,
      showInventory,
      showScore,
      setLampLit,
      log,
      openObject,
      closeObject,
      takeItem,
      dropItem,
      putItem,
      moveObject,
      examineObject,
      readItem,
      attackTroll,
      attackThief,
      unlockGrate,
      lockGrate,
      sayUlysses,
      turnBolt,
      pushButton,
      currentRoom,
      flags.cyclopsFled,
      incrementMoves,
      restartGame,
      gameOver,
      pendingRestartConfirm,
      saveGame,
      restoreGame,
    ]
  );

  const exits = useMemo(() => room.exits, [room]);

  return {
    currentRoom,
    room,
    roomText,
    exits,
    isDark,
    isUnderground,
    inventory,
    items,
    flags,
    hasLampLit,
    score,
    moves,
    trollHealth,
    trollDisarmed,
    playerHealth,
    deaths,
    gameOver,
    terminalLogs,
    moveRoom,
    interactWithObject,
    runCommand,
  };
}
