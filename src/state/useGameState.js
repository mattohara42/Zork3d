import { useCallback, useMemo, useState } from 'react';
import { ROOMS } from '../gameData/rooms';
import { INITIAL_ITEMS } from '../gameData/items';

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
  'examine <thing>, open/close <thing>, take/drop <thing>, read <thing>, ' +
  'inventory, light lamp / turn off lamp.';

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
  });
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [terminalLogs, setTerminalLogs] = useState([]);

  const room = ROOMS[currentRoom];
  // isDark: a dark room with no light source - pitch black, can't see.
  // isUnderground: a dark room WITH the lamp lit - visible, but by
  // lantern-light rather than daylight, so the viewport should look and
  // feel different even though the player can see.
  const isDark = !!room.dark && !hasLampLit;
  const isUnderground = !!room.dark && hasLampLit;

  const log = useCallback((message) => {
    setTerminalLogs((prev) => [...prev, message]);
  }, []);

  const isItemReachable = useCallback(
    (item) => {
      if (item.location === 'inventory') return true;
      if (item.location === currentRoom) return true;
      if (item.location === 'mailbox') {
        return currentRoom === 'westOfHouse' && flags.mailboxOpen;
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
      const targetId = room.exits[direction];
      if (!targetId) {
        log("You can't go that way.");
        return;
      }
      const guard = room.exitGuards && room.exitGuards[direction];
      const blockedMessage = guard && guard(flags);
      if (blockedMessage) {
        log(blockedMessage);
        return;
      }
      setCurrentRoom(targetId);
    },
    [room, flags, log]
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
      setItems((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], location: 'inventory' },
      }));
      setInventory((prev) => [...prev, item.id]);
      log('Taken.');
    },
    [findItemByName, isItemReachable, log]
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
      log('Dropped.');
    },
    [findItemByName, currentRoom, log]
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
      if (noun === 'table') {
        if (currentRoom !== 'kitchen') {
          log("You don't see that here.");
        } else {
          log('A table seems to have been used recently for the preparation of food.');
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
    [currentRoom, flags.windowOpen, describeMailbox, findItemByName, isItemReachable, log]
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
    log(room.text);
  }, [room, log]);

  const setLampLit = useCallback(
    (lit) => {
      setHasLampLit(lit);
      log(lit ? 'The lamp is now on.' : 'The lamp is now off.');
    },
    [log]
  );

  /** Generic dispatcher matching the requested hook shape. */
  const interactWithObject = useCallback(
    (objectName, action) => {
      switch (action) {
        case 'open': openObject(objectName); break;
        case 'close': closeObject(objectName); break;
        case 'take': takeItem(objectName); break;
        case 'drop': dropItem(objectName); break;
        case 'examine': examineObject(objectName); break;
        case 'read': readItem(objectName); break;
        default: log('Nothing happens.');
      }
    },
    [openObject, closeObject, takeItem, dropItem, examineObject, readItem, log]
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
      if (LAMP_ON_COMMANDS.includes(cmd)) {
        setLampLit(true);
        return;
      }
      if (LAMP_OFF_COMMANDS.includes(cmd)) {
        setLampLit(false);
        return;
      }

      const words = cmd.split(/\s+/);
      const verb = words[0];
      const skipAt = verb === 'look' && words[1] === 'at' ? 2 : 1;
      const noun = words.slice(skipAt).join(' ').replace(/^the\s+/, '').trim();

      switch (verb) {
        case 'enter': moveRoom('in'); break;
        case 'leave': moveRoom('out'); break;
        case 'open': openObject(noun); break;
        case 'close': closeObject(noun); break;
        case 'take':
        case 'get': takeItem(noun); break;
        case 'drop': dropItem(noun); break;
        case 'examine':
        case 'x':
        case 'look': examineObject(noun); break;
        case 'read': readItem(noun); break;
        default: log("I don't understand that command.");
      }
    },
    [moveRoom, lookAround, showInventory, setLampLit, log, openObject, closeObject, takeItem, dropItem, examineObject, readItem]
  );

  const exits = useMemo(() => room.exits, [room]);

  return {
    currentRoom,
    room,
    exits,
    isDark,
    isUnderground,
    inventory,
    items,
    flags,
    hasLampLit,
    terminalLogs,
    moveRoom,
    interactWithObject,
    runCommand,
  };
}
