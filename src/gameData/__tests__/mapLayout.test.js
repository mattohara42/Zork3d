import { describe, it, expect } from 'vitest';
import { ROOMS } from '../rooms';
import { buildMapGraph, isMazeRoom, MAZE_NODE_ID, ROOM_COORDS } from '../mapLayout';

describe('isMazeRoom', () => {
  it('matches every maze room and dead end, nothing else', () => {
    for (let i = 1; i <= 15; i++) expect(isMazeRoom(`maze${i}`)).toBe(true);
    for (let i = 1; i <= 4; i++) expect(isMazeRoom(`deadEnd${i}`)).toBe(true);
    expect(isMazeRoom('gratingRoom')).toBe(false);
    expect(isMazeRoom('cyclopsRoom')).toBe(false);
    expect(isMazeRoom('westOfHouse')).toBe(false);
  });
});

describe('buildMapGraph', () => {
  it('gives every reachable room a coordinate', () => {
    const { nodeCoords } = buildMapGraph();
    for (const id of Object.keys(ROOMS)) {
      if (isMazeRoom(id)) continue;
      expect(nodeCoords[id], `missing coordinate for ${id}`).toBeDefined();
    }
  });

  it('collapses the maze to a single node positioned at maze1', () => {
    const { nodeCoords } = buildMapGraph();
    expect(nodeCoords[MAZE_NODE_ID]).toEqual(ROOM_COORDS.maze1);
  });

  it('drops edges purely internal to the maze blob', () => {
    const { edges } = buildMapGraph();
    for (const [a, b] of edges) {
      expect(a === MAZE_NODE_ID && b === MAZE_NODE_ID).toBe(false);
    }
  });

  it('never places two rendered nodes close enough to visually overlap', () => {
    // Matches MapPanel's NODE_RADIUS (20px) at mapLayout's own scale
    // (CELL 78px/unit in MapPanel) - two circles need >~0.51 units of
    // separation to avoid overlapping; this only regressed once already
    // (West of House and the Living Room landed on the exact same cell
    // on a from-scratch playthrough) so it's worth locking in for real.
    const MIN_RENDER_SEPARATION = 0.64;
    const { nodeCoords } = buildMapGraph();
    // nodeCoords also carries every individual maze room's own
    // coordinate (needed internally to place their real neighbors, e.g.
    // Cyclops Room off maze15) even though MapPanel never renders them
    // - only non-maze rooms and the one synthetic blob node actually
    // show up, so only those need to stay clear of each other.
    const entries = Object.entries(nodeCoords).filter(
      ([id]) => id === MAZE_NODE_ID || !isMazeRoom(id)
    );
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [idA, [ax, ay]] = entries[i];
        const [idB, [bx, by]] = entries[j];
        const dist = Math.hypot(ax - bx, ay - by);
        expect(dist, `${idA} and ${idB} are too close (${dist})`).toBeGreaterThanOrEqual(
          MIN_RENDER_SEPARATION
        );
      }
    }
  });
});
