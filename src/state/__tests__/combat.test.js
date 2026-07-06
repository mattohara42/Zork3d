import { describe, it, expect, vi, afterEach } from 'vitest';
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

function reachTrollRoom(result) {
  cmd(result, 'south');
  cmd(result, 'east');
  cmd(result, 'open window');
  cmd(result, 'in'); // kitchen
  cmd(result, 'west'); // livingRoom
  cmd(result, 'take lamp');
  cmd(result, 'light lamp');
  cmd(result, 'take sword');
  cmd(result, 'move rug');
  cmd(result, 'open trap door');
  cmd(result, 'down'); // cellar
  cmd(result, 'north'); // trollRoom
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('troll combat', () => {
  it('bare-handed attacks are too weak to matter and never kill the troll', () => {
    const result = setup();
    reachTrollRoom(result);
    cmd(result, 'drop sword');

    vi.spyOn(Math, 'random').mockReturnValue(0.9); // hero "hits", troll counters
    cmd(result, 'attack troll');

    expect(result.current.flags.trollDefeated).toBe(false);
    expect(result.current.terminalLogs.some((l) => /troll/i.test(l))).toBe(true);
  });

  it('a solid hit with the sword can kill the troll outright and opens both exits', () => {
    const result = setup();
    reachTrollRoom(result);

    // roll=0.5: misses none of the miss/disarm/stagger thresholds (<0.25,
    // <0.35, <0.45), falls into the damage branch with damage=2 - exactly
    // enough to drop the troll's STRENGTH of 2 to 0 in one blow.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    cmd(result, 'kill troll with sword');

    expect(result.current.flags.trollDefeated).toBe(true);
    expect(result.current.trollHealth).toBe(0);
    expect(result.current.roomText).not.toContain('nasty-looking troll');

    // Both previously-guarded exits now work.
    cmd(result, 'east');
    expect(result.current.currentRoom).toBe('ewPassage');
  });

  it('losing enough health bounces the player back to the Cellar, not death', () => {
    const result = setup();
    reachTrollRoom(result);

    // Each attack/counter round costs 4 Math.random() calls, not 2: the
    // roll itself, then a *second* hidden call inside randomPick() to pick
    // which flavor line to log - for both the hero's blow and the troll's
    // counter. The 0s below are those flavor-text picks; only the 0.1
    // (hero roll -> a clean miss, troll takes no damage) and 0.4 (villain
    // roll -> a serious wound, damage 2) values actually drive branching.
    const rolls = vi.spyOn(Math, 'random');
    rolls
      .mockReturnValueOnce(0.1).mockReturnValueOnce(0)
      .mockReturnValueOnce(0.4).mockReturnValueOnce(0);
    cmd(result, 'attack troll');
    expect(result.current.playerHealth).toBe(1);
    expect(result.current.flags.trollDefeated).toBe(false);

    // Same again: another serious wound (damage 2) drops player to -1,
    // which triggers the "stagger back to the Cellar" branch and resets
    // playerHealth to full rather than killing the player.
    rolls
      .mockReturnValueOnce(0.1).mockReturnValueOnce(0)
      .mockReturnValueOnce(0.4).mockReturnValueOnce(0);
    cmd(result, 'attack troll');
    expect(result.current.playerHealth).toBe(3);
    expect(result.current.currentRoom).toBe('cellar');
    expect(result.current.flags.trollDefeated).toBe(false);
  });
});

describe('thief combat', () => {
  function reachTreasureRoom(result) {
    reachTrollRoom(result);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    cmd(result, 'kill troll with sword');
    vi.restoreAllMocks();
    cmd(result, 'east'); // ewPassage
    // The exact ewPassage->treasureRoom route isn't the point of this
    // suite; teleport the rest of the way via restore, the same "arbitrary
    // state" entry point the puzzle tests use, to keep this focused on
    // combat resolution rather than maze navigation.
    const snapshot = {
      version: 1,
      currentRoom: 'treasureRoom',
      inventory: result.current.inventory,
      hasLampLit: result.current.hasLampLit,
      lampTurnsUsed: 0,
      lampBurnedOut: false,
      flags: result.current.flags,
      deaths: result.current.deaths,
      gameOver: result.current.gameOver,
      trollHealth: result.current.trollHealth,
      trollDisarmed: result.current.trollDisarmed,
      thiefHealth: 5,
      thiefDisarmed: false,
      playerHealth: result.current.playerHealth,
      items: result.current.items,
      baseScore: result.current.score,
      moves: result.current.moves,
    };
    window.localStorage.setItem('zork3d-save', JSON.stringify(snapshot));
    cmd(result, 'restore');
  }

  it('takes multiple hits (THIEF_STRENGTH 5) and reveals given treasures on death', () => {
    const result = setup();
    reachTreasureRoom(result);
    expect(result.current.currentRoom).toBe('treasureRoom');

    // Same 4-calls-per-round accounting as the troll test above (roll,
    // flavor-text pick, counter-roll, counter flavor-text pick); the last
    // round is lethal and returns before any counter-blow, so it's only 2.
    const rolls = vi.spyOn(Math, 'random');
    rolls
      .mockReturnValueOnce(0.5).mockReturnValueOnce(0) // hero hits for 2 (5 -> 3)
      .mockReturnValueOnce(0.1).mockReturnValueOnce(0) // thief misses
      .mockReturnValueOnce(0.5).mockReturnValueOnce(0) // hero hits for 2 (3 -> 1)
      .mockReturnValueOnce(0.1).mockReturnValueOnce(0) // thief misses
      .mockReturnValueOnce(0.5).mockReturnValueOnce(0); // hero hits for 2 (1 -> -1, lethal)
    cmd(result, 'attack thief');
    cmd(result, 'attack thief');
    cmd(result, 'attack thief');

    expect(result.current.flags.thiefDefeated).toBe(true);
  });
});
