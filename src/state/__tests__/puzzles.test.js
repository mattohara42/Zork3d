import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';

function setup() {
  const { result } = renderHook(() => useGameState());
  return result;
}

function cmd(result, text) {
  act(() => {
    result.current.runCommand(text);
  });
}

/**
 * Uses the real save/restore round-trip as a test-only teleport: building a
 * localStorage snapshot and restoring it is the same "arbitrary state" entry
 * point a player's own save file would produce, so it exercises restoreGame
 * for free while letting these tests skip re-walking the full room graph to
 * reach far-flung puzzle rooms (Treasure Room, End of Rainbow, Dome Room).
 */
function teleport(result, { room, carrying = [], itemPatches = {}, flagPatches = {}, statePatches = {} }) {
  const items = { ...result.current.items };
  for (const id of carrying) {
    items[id] = { ...items[id], location: 'inventory' };
  }
  for (const [id, patch] of Object.entries(itemPatches)) {
    items[id] = { ...items[id], ...patch };
  }
  const snapshot = {
    version: 1,
    currentRoom: room,
    inventory: carrying,
    hasLampLit: false,
    lampTurnsUsed: 0,
    lampBurnedOut: false,
    flags: { ...result.current.flags, ...flagPatches },
    deaths: result.current.deaths,
    gameOver: false,
    trollHealth: result.current.trollHealth,
    trollDisarmed: result.current.trollDisarmed,
    thiefHealth: 5,
    thiefDisarmed: false,
    playerHealth: result.current.playerHealth,
    items,
    baseScore: 0,
    moves: result.current.moves,
    ...statePatches,
  };
  window.localStorage.setItem('zork3d-save', JSON.stringify(snapshot));
  cmd(result, 'restore');
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('trophy case scoring', () => {
  it('scores tvalue while deposited and un-scores it when taken back out, without re-paying the one-time value bonus', () => {
    const result = setup();
    // valueScored: true simulates the painting having already been taken
    // once for its one-time bonus before being deposited (SCORE-OBJ only
    // zeroes VALUE once) - see useGameState's takeItem.
    teleport(result, {
      room: 'livingRoom',
      carrying: ['painting'],
      itemPatches: { painting: { valueScored: true } },
    });

    cmd(result, 'put painting in case');
    expect(result.current.items.painting.location).toBe('trophyCase');
    expect(result.current.score).toBe(6); // painting's tvalue

    cmd(result, 'take painting');
    expect(result.current.items.painting.location).toBe('inventory');
    expect(result.current.score).toBe(0); // no second value bonus
  });
});

describe('egg fragility', () => {
  it('refuses to open without a tool', () => {
    const result = setup();
    teleport(result, { room: 'upATree' });
    cmd(result, 'open egg');
    expect(result.current.terminalLogs.at(-1)).toBe(
      'You have neither the tools nor the expertise to open it without damaging it.'
    );
    expect(result.current.items.egg.broken).toBe(false);
  });

  it('breaks the egg (and the canary inside it) when opened with the knife', () => {
    const result = setup();
    teleport(result, { room: 'upATree', carrying: ['knife'] });
    cmd(result, 'open egg');
    expect(result.current.items.egg.broken).toBe(true);
    expect(result.current.items.egg.description).toBe('A somewhat ruined egg.');
    expect(result.current.items.canary.broken).toBe(true);
    expect(result.current.items.canary.location).toBe('upATree');
  });
});

describe('give the egg to the thief', () => {
  it('opens it safely, undamaged, once the thief dies holding it', () => {
    const result = setup();
    teleport(result, {
      room: 'treasureRoom',
      carrying: ['egg', 'sword'],
      statePatches: { thiefHealth: 1 },
    });

    cmd(result, 'give egg to thief');
    expect(result.current.items.egg.location).toBe('thief');
    expect(result.current.inventory).not.toContain('egg');

    // roll=0.5 lands in the damage branch (damage 2) with thiefHealth at 1,
    // which is lethal and returns before any counter-blow - see combat.test.js.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    cmd(result, 'attack thief');

    expect(result.current.flags.thiefDefeated).toBe(true);
    expect(result.current.flags.eggOpenedSafely).toBe(true);
    expect(result.current.items.egg.broken).toBe(false);
    expect(result.current.items.egg.location).toBe('treasureRoom');
    expect(result.current.items.canary.location).toBe('treasureRoom');
  });
});

describe('sceptre and the rainbow', () => {
  it('makes the rainbow solid and reveals the pot of gold, and un-solidifies on a second wave', () => {
    const result = setup();
    teleport(result, { room: 'endOfRainbow', carrying: ['sceptre'] });

    cmd(result, 'wave sceptre');
    expect(result.current.flags.rainbowFlag).toBe(true);
    expect(result.current.items.potOfGold.location).toBe('endOfRainbow');

    cmd(result, 'wave sceptre');
    expect(result.current.flags.rainbowFlag).toBe(false);
  });

  it('is fatal to wave while actually standing on the rainbow', () => {
    const result = setup();
    teleport(result, { room: 'onRainbow', carrying: ['sceptre'] });

    cmd(result, 'wave sceptre');
    expect(result.current.deaths).toBe(1);
    expect(result.current.currentRoom).toBe('forest1');
    expect(
      result.current.terminalLogs.some((l) => l.includes('structural integrity of the rainbow'))
    ).toBe(true);
  });
});

describe('dome room rope', () => {
  it('ties to the railing and can be untied again', () => {
    const result = setup();
    teleport(result, { room: 'domeRoom', carrying: ['rope'] });

    cmd(result, 'tie rope to railing');
    expect(result.current.flags.domeFlag).toBe(true);

    cmd(result, 'untie rope');
    expect(result.current.flags.domeFlag).toBe(false);
  });
});
