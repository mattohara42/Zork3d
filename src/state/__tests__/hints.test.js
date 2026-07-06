import { describe, it, expect, beforeEach } from 'vitest';
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

/** See puzzles.test.js for why teleporting via a crafted save is the
 * right tool here - reaching the Maze for real requires defeating the
 * troll first, which this test has no need to exercise. */
function teleport(result, room) {
  const snapshot = {
    version: 1,
    currentRoom: room,
    visitedRooms: [room],
    inventory: [],
    hasLampLit: true,
    lampTurnsUsed: 0,
    lampBurnedOut: false,
    flags: result.current.flags,
    deaths: 0,
    gameOver: false,
    trollHealth: result.current.trollHealth,
    trollDisarmed: false,
    thiefHealth: 5,
    thiefDisarmed: false,
    playerHealth: result.current.playerHealth,
    items: result.current.items,
    baseScore: 0,
    moves: 0,
  };
  window.localStorage.setItem('zork3d-save', JSON.stringify(snapshot));
  cmd(result, 'restore');
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('hint', () => {
  it('does nothing outside the Maze', () => {
    const result = setup();
    cmd(result, 'hint');
    expect(result.current.terminalLogs.at(-1)).toBe("There's nothing to hint about here.");
  });

  it('escalates through three tiers in the Maze, then repeats the last one', () => {
    const result = setup();
    teleport(result, 'maze1');

    cmd(result, 'hint');
    const first = result.current.terminalLogs.at(-1);
    expect(first).toContain('leaving something recognizable behind');

    cmd(result, 'hint');
    const second = result.current.terminalLogs.at(-1);
    expect(second).toContain('skeleton');
    expect(second).not.toBe(first);

    cmd(result, 'hint');
    const third = result.current.terminalLogs.at(-1);
    expect(third).toContain('west into the maze');

    cmd(result, 'hint'); // past the last tier - repeats it, doesn't error
    expect(result.current.terminalLogs.at(-1)).toBe(third);
  });

  it("doesn't cost a turn", () => {
    const result = setup();
    teleport(result, 'maze1');
    const movesBefore = result.current.moves;
    cmd(result, 'hint');
    expect(result.current.moves).toBe(movesBefore);
  });

  it('persists its progress through save/restore', () => {
    const result = setup();
    teleport(result, 'maze1');
    cmd(result, 'hint');
    cmd(result, 'hint');
    const secondTierText = result.current.terminalLogs.at(-1);

    cmd(result, 'save');
    cmd(result, 'restart');
    cmd(result, 'y');
    cmd(result, 'restore'); // brings back currentRoom: 'maze1' and mazeHintLevel: 2

    // Third `hint` after restoring should pick up at tier 3, not reset to tier 1.
    cmd(result, 'hint');
    expect(result.current.terminalLogs.at(-1)).not.toBe(secondTierText);
    expect(result.current.terminalLogs.at(-1)).toContain('west into the maze');
  });
});
