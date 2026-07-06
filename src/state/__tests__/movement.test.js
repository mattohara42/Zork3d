import { describe, it, expect, vi } from 'vitest';
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

describe('movement', () => {
  it('starts in West of House, empty-handed', () => {
    const result = setup();
    expect(result.current.currentRoom).toBe('westOfHouse');
    expect(result.current.inventory).toEqual([]);
    expect(result.current.roomText).toContain('open field west of a white house');
  });

  it('moves through defined exits and updates room text', () => {
    const result = setup();
    cmd(result, 'south');
    expect(result.current.currentRoom).toBe('southOfHouse');
    cmd(result, 'east');
    expect(result.current.currentRoom).toBe('behindHouse');
  });

  it('logs a blocked-exit message and does not move', () => {
    const result = setup();
    cmd(result, 'south'); // southOfHouse
    cmd(result, 'east'); // behindHouse
    cmd(result, 'open window');
    cmd(result, 'in'); // kitchen
    expect(result.current.currentRoom).toBe('kitchen');
    cmd(result, 'down');
    expect(result.current.currentRoom).toBe('kitchen');
    expect(result.current.terminalLogs.at(-1)).toBe('Only Santa Claus climbs down chimneys.');
  });

  it('refuses an undefined direction with no blocked-exit text', () => {
    const result = setup();
    cmd(result, 'north'); // northOfHouse - has no "up" style undefined dirs to test, use a real undefined one
    // northOfHouse has exits south/east/north only; west is undefined with no blockedExits
    cmd(result, 'west');
    expect(result.current.terminalLogs.at(-1)).toBe("You can't go that way.");
  });

  it('kills the player with a grue on a blind move into an undefined direction while dark', () => {
    const result = setup();
    const randomSpy = vi.spyOn(Math, 'random');
    cmd(result, 'south'); // southOfHouse
    cmd(result, 'east'); // behindHouse
    cmd(result, 'open window');
    cmd(result, 'in'); // kitchen
    cmd(result, 'up'); // attic - dark, no lamp
    expect(result.current.isDark).toBe(true);

    randomSpy.mockReturnValue(0); // forces the 80% grue chance to hit
    cmd(result, 'north'); // undefined direction in the attic, no blockedExits entry
    randomSpy.mockRestore();

    expect(result.current.terminalLogs).toContain(
      'Oh, no! You have walked into the slavering fangs of a lurking grue!'
    );
    expect(result.current.deaths).toBe(1);
    expect(result.current.score).toBe(-10);
    expect(result.current.currentRoom).toBe('forest1');
  });
});

describe('mailbox and items', () => {
  it('opening the mailbox reveals the leaflet, which can be taken, read, and dropped', () => {
    const result = setup();
    cmd(result, 'examine mailbox');
    expect(result.current.terminalLogs.at(-1)).toBe('The small mailbox is closed.');

    cmd(result, 'open mailbox');
    expect(result.current.flags.mailboxOpen).toBe(true);

    cmd(result, 'take leaflet');
    expect(result.current.inventory).toContain('leaflet');
    expect(result.current.items.leaflet.location).toBe('inventory');

    cmd(result, 'read leaflet');
    expect(result.current.terminalLogs.at(-1)).toContain('WELCOME TO ZORK');

    cmd(result, 'drop leaflet');
    expect(result.current.inventory).not.toContain('leaflet');
    expect(result.current.items.leaflet.location).toBe('westOfHouse');
  });

  it('cannot take a non-portable fixture', () => {
    const result = setup();
    cmd(result, 'take mailbox');
    expect(result.current.terminalLogs.at(-1)).toBe('It is securely anchored.');
  });
});

describe('lamp', () => {
  it('only lights when carried, and toggles isUnderground vs isDark', () => {
    const result = setup();
    cmd(result, 'light lamp');
    expect(result.current.terminalLogs.at(-1)).toBe("You don't have a lamp.");

    cmd(result, 'south');
    cmd(result, 'east');
    cmd(result, 'open window');
    cmd(result, 'in'); // kitchen
    cmd(result, 'west'); // livingRoom
    cmd(result, 'take lamp');
    cmd(result, 'light lamp');
    expect(result.current.hasLampLit).toBe(true);

    cmd(result, 'move rug');
    cmd(result, 'open trap door');
    cmd(result, 'down'); // cellar - dark, but lit by lamp
    expect(result.current.isDark).toBe(false);
    expect(result.current.isUnderground).toBe(true);
  });

  it('dims, nearly dies, and burns out after its real turn thresholds', () => {
    const result = setup();
    cmd(result, 'south');
    cmd(result, 'east');
    cmd(result, 'open window');
    cmd(result, 'in');
    cmd(result, 'west');
    cmd(result, 'take lamp');
    cmd(result, 'light lamp');

    // "look" is a free action (no incrementMoves) - walk a livingRoom/kitchen
    // loop instead, since every real move ticks the lamp's lit-turn counter.
    const walk = (n) => {
      for (let i = 0; i < n; i++) {
        cmd(result, result.current.currentRoom === 'livingRoom' ? 'east' : 'west');
      }
    };

    walk(99);
    expect(result.current.terminalLogs).not.toContain('The lamp appears a bit dimmer.');
    walk(1); // 100th lit turn
    expect(result.current.terminalLogs).toContain('The lamp appears a bit dimmer.');

    walk(69); // up to 169
    walk(1); // 170th
    expect(result.current.terminalLogs).toContain('The lamp is definitely dimmer now.');

    walk(14); // up to 184
    walk(1); // 185th
    expect(result.current.terminalLogs).toContain('The lamp is nearly out.');

    walk(1); // 186th - burns out for good
    expect(result.current.hasLampLit).toBe(false);
    expect(result.current.terminalLogs).toContain("You'd better have more light than from the brass lantern.");
    cmd(result, 'light lamp');
    expect(result.current.terminalLogs.at(-1)).toBe("A burned-out lamp won't light.");
  });
});

describe('restart confirmation', () => {
  it('asks for Y/N confirmation and only resets on yes', () => {
    const result = setup();
    cmd(result, 'south');
    cmd(result, 'restart');
    expect(result.current.terminalLogs.at(-1)).toBe('Do you wish to restart? (Y is affirmative): ');
    expect(result.current.currentRoom).toBe('southOfHouse');

    cmd(result, 'n');
    expect(result.current.terminalLogs.at(-1)).toBe('Ok.');
    expect(result.current.currentRoom).toBe('southOfHouse');

    cmd(result, 'restart');
    cmd(result, 'y');
    expect(result.current.currentRoom).toBe('westOfHouse');
  });
});
