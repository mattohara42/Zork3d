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
  PLAYER_MAX_HEALTH,
} from '../gameData/combat';

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
  'examine <thing>, open/close <thing>, take/drop <thing>, put <thing> in ' +
  'case, read <thing>, move <thing>, attack/kill <thing>, inventory, ' +
  'score, light lamp / turn off lamp.';

function resolveRoomText(room, flags, items, currentRoom) {
  const base = typeof room.text === 'function' ? room.text(flags) : room.text;
  const floorLines = Object.values(items)
    .filter((item) => item.location === currentRoom && item.floorText)
    .map((item) => item.floorText);
  return floorLines.length > 0 ? `${base}\n${floorLines.join('\n')}` : base;
}

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
  const [flags, setFlags] = useState({
    mailboxOpen: false,
    windowOpen: false,
    rugMoved: false,
    trapdoorOpen: false,
    trapdoorBarred: false,
    trollDefeated: false,
  });
  // Combat is only relevant to the Troll Room right now, so this is
  // simple top-level state rather than something threaded per-room.
  const [trollHealth, setTrollHealth] = useState(TROLL_STRENGTH);
  const [trollDisarmed, setTrollDisarmed] = useState(false);
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

  const incrementMoves = useCallback(() => setMoves((m) => m + 1), []);

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
      incrementMoves();
      const targetId = room.exits[direction];
      if (!targetId) {
        const blockedEntry = room.blockedExits && room.blockedExits[direction];
        const blockedMessage = typeof blockedEntry === 'function' ? blockedEntry(flags) : blockedEntry;
        log(blockedMessage || "You can't go that way.");
        return;
      }
      // A guard's return value is a discriminated union: a string blocks
      // the move and is shown as the reason; an object (or null/undefined)
      // allows it, and if the object has flagUpdates they're applied as a
      // side effect of a *successful* move (the up-chimney puzzle needs
      // this: climbing out with the lamp and at most one other item
      // succeeds, which also resets the barred trap door).
      const guard = room.exitGuards && room.exitGuards[direction];
      const guardResult = guard && guard(flags, inventory);
      if (typeof guardResult === 'string') {
        log(guardResult);
        return;
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
      }

      // Environment switch: underground + no lantern lit is pitch black,
      // regardless of any onEnter message above (e.g. the Cellar's trap
      // door can slam shut *and* leave you blind in the same move).
      if (targetRoom.environment === 'underground' && targetRoom.dark && !hasLampLit) {
        log('It is pitch black. You are likely to be eaten by a grue.');
      }
    },
    [room, flags, inventory, hasLampLit, log, incrementMoves]
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
      log("You can't open that.");
    },
    [currentRoom, flags, log]
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
      log('Taken.');
    },
    [currentRoom, findItemByName, isItemReachable, log]
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
      log("You can't move that.");
    },
    [currentRoom, flags.rugMoved, log]
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
        log(randomPick(HERO_MISS));
      } else {
        log(randomPick(HERO_LIGHT_WOUND));
      }
      return counterBlow(true);
    }

    if (roll < 0.25) {
      log(randomPick(HERO_MISS));
      return counterBlow(true);
    }
    if (roll < 0.35 && !trollDisarmed) {
      log(randomPick(HERO_DISARM));
      setTrollDisarmed(true);
      return counterBlow(false);
    }
    if (roll < 0.45) {
      log(randomPick(HERO_STAGGER));
      return counterBlow(false);
    }

    const damage = roll < 0.6 ? 2 : 1;
    const nextHealth = trollHealth - damage;
    log(randomPick(damage === 2 ? HERO_SERIOUS_WOUND : HERO_LIGHT_WOUND));

    if (nextHealth <= 0) {
      log(randomPick(HERO_KILL));
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
      const item = findItemByName(noun);
      if (item && isItemReachable(item)) {
        log(item.description);
        return;
      }
      log("You don't see that here.");
    },
    [currentRoom, flags.windowOpen, flags.rugMoved, flags.trapdoorOpen, describeMailbox, findItemByName, isItemReachable, items, log]
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
      setHasLampLit(lit);
      log(lit ? 'The lamp is now on.' : 'The lamp is now off.');
    },
    [items.lamp, log]
  );

  /** Generic dispatcher matching the requested hook shape. */
  const interactWithObject = useCallback(
    (objectName, action) => {
      incrementMoves();
      switch (action) {
        case 'open': openObject(objectName); break;
        case 'close': closeObject(objectName); break;
        case 'take': takeItem(objectName); break;
        case 'drop': dropItem(objectName); break;
        case 'move': moveObject(objectName); break;
        case 'examine': examineObject(objectName); break;
        case 'read': readItem(objectName); break;
        case 'attack': attackTroll(); break;
        default: log('Nothing happens.');
      }
    },
    [openObject, closeObject, takeItem, dropItem, moveObject, examineObject, readItem, attackTroll, log, incrementMoves]
  );

  /** Parses a free-text command line, same verb set as the vanilla engine. */
  const runCommand = useCallback(
    (raw) => {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;

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
        case 'push':
        case 'raise': incrementMoves(); moveObject(noun); break;
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
          if (!target || target === 'troll') {
            attackTroll();
          } else {
            log("You can't attack that.");
          }
          break;
        }
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
      incrementMoves,
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
    terminalLogs,
    moveRoom,
    interactWithObject,
    runCommand,
  };
}
