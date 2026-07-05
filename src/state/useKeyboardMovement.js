import { useEffect } from 'react';

const KEY_MAP = {
  ArrowUp: 'north', w: 'north', W: 'north',
  ArrowDown: 'south', s: 'south', S: 'south',
  ArrowRight: 'east', d: 'east', D: 'east',
  ArrowLeft: 'west', a: 'west', A: 'west',
};

/**
 * WASD / arrow-key movement, mirroring the vanilla engine's keydown
 * handler. Ignored while focus is in a text input so typing "s" into the
 * command box doesn't also walk the player south.
 */
export function useKeyboardMovement(moveRoom) {
  useEffect(() => {
    function handleKeyDown(e) {
      const direction = KEY_MAP[e.key];
      if (!direction) return;

      const active = document.activeElement;
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
      if (isTyping) return;

      moveRoom(direction);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveRoom]);
}
