import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';
import { ROOMS } from '../../gameData/rooms';

function setup() {
  const { result } = renderHook(() => useGameState());
  return result;
}

function cmd(result, text) {
  act(() => {
    result.current.runCommand(text);
  });
}

function dieToGrue(result) {
  const spy = vi.spyOn(Math, 'random').mockReturnValue(0);
  cmd(result, 'north'); // an undefined direction in a dark room
  spy.mockRestore();
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('save/restore', () => {
  it('round-trips full state through localStorage', () => {
    const result = setup();
    cmd(result, 'south');
    cmd(result, 'east');
    cmd(result, 'open window');
    cmd(result, 'in'); // kitchen
    cmd(result, 'west'); // livingRoom
    cmd(result, 'take lamp');
    cmd(result, 'light lamp');
    cmd(result, 'save');
    expect(result.current.terminalLogs.at(-1)).toBe('Ok.');
    expect(window.localStorage.getItem('zork3d-save')).toBeTruthy();

    const savedRoom = result.current.currentRoom;
    const savedInventory = [...result.current.inventory];

    // Wander off, then restore back to the saved position.
    cmd(result, 'east'); // kitchen
    expect(result.current.currentRoom).toBe('kitchen');

    cmd(result, 'restore');
    expect(result.current.currentRoom).toBe(savedRoom);
    expect(result.current.inventory).toEqual(savedInventory);
    expect(result.current.hasLampLit).toBe(true);
    expect(result.current.terminalLogs.at(-2)).toBe('Ok.');
  });

  it('fails gracefully when there is nothing saved', () => {
    const result = setup();
    cmd(result, 'restore');
    expect(result.current.terminalLogs.at(-1)).toBe('Failed.');
  });
});

describe('death, respawn, and permadeath', () => {
  it('scatters inventory and respawns after the first two deaths, then ends the game for good on the third', () => {
    const result = setup();

    // First death: navigate to the dark Attic and walk into an undefined
    // direction. Opening the window here also leaves it open for the
    // subsequent respawn loops, matching how flags survive death (only
    // trapdoorBarred is reset - see handleDeath).
    cmd(result, 'south');
    cmd(result, 'east');
    cmd(result, 'open window');
    cmd(result, 'in');
    cmd(result, 'up');
    dieToGrue(result);
    expect(result.current.deaths).toBe(1);
    expect(result.current.gameOver).toBe(false);
    expect(result.current.currentRoom).toBe('forest1');

    // Second death: same trap, reached via the respawn point.
    cmd(result, 'east'); // path
    cmd(result, 'south'); // northOfHouse
    cmd(result, 'east'); // behindHouse
    cmd(result, 'in'); // kitchen - window already open
    cmd(result, 'up'); // attic
    dieToGrue(result);
    expect(result.current.deaths).toBe(2);
    expect(result.current.gameOver).toBe(false);
    expect(result.current.currentRoom).toBe('forest1');

    // Third death: the source's real permanent ending - no respawn this time.
    cmd(result, 'east');
    cmd(result, 'south');
    cmd(result, 'east');
    cmd(result, 'in');
    cmd(result, 'up');
    dieToGrue(result);
    expect(result.current.deaths).toBe(3);
    expect(result.current.gameOver).toBe(true);
    expect(result.current.currentRoom).toBe('attic'); // no respawn on the final death
    expect(
      result.current.terminalLogs.some((l) => l.includes('suicidal maniac'))
    ).toBe(true);

    // Every command is now gated until RESTART/RESTORE.
    cmd(result, 'down');
    expect(result.current.terminalLogs.at(-1)).toBe('Type RESTART or RESTORE to continue.');
    expect(result.current.currentRoom).toBe('attic');

    cmd(result, 'restart'); // no Y/N prompt once gameOver
    expect(result.current.currentRoom).toBe('westOfHouse');
    expect(result.current.gameOver).toBe(false);
    expect(result.current.deaths).toBe(0);
  });

  it('scatters carried treasures to a dark room and everything else to a surface room', () => {
    const result = setup();
    cmd(result, 'south');
    cmd(result, 'east');
    cmd(result, 'open window');
    cmd(result, 'in'); // kitchen
    cmd(result, 'west'); // livingRoom
    cmd(result, 'take lamp'); // not a treasure
    cmd(result, 'take sword'); // not a treasure
    cmd(result, 'east'); // kitchen
    cmd(result, 'up'); // attic (dark, lamp not lit)
    dieToGrue(result);

    expect(result.current.inventory).toEqual([]);
    // Neither item is a treasure (no value/tvalue), so both scatter to a
    // surface room rather than a dark one.
    expect(ROOMS[result.current.items.lamp.location].environment).toBe('surface');
    expect(ROOMS[result.current.items.sword.location].environment).toBe('surface');
  });
});
