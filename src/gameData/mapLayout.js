import { ROOMS } from './rooms';

// The Maze (15 numbered rooms + 4 dead ends) is deliberately disorienting
// in the source - "twisty little passages, all alike" is the entire
// puzzle. Auto-mapping each individual room would hand the player the
// answer, so every one of these collapses onto a single synthetic map
// node instead (see MapPanel) - matches the user's explicit choice to
// keep the Maze a blob until solved.
const MAZE_ROOM_PATTERN = /^(maze\d+|deadEnd\d+)$/;
export const isMazeRoom = (id) => MAZE_ROOM_PATTERN.test(id);
export const MAZE_NODE_ID = 'maze';

// Not a real geographic projection - Zork's map isn't planar everywhere
// (the maze especially), so this is a schematic, BFS-ordered layout:
// whichever direction first reaches a room from West of House fixes its
// grid cell, and any other, later-discovered connection into that room
// is drawn as an edge without moving it. up/down collapse onto the same
// axis as north/south (vertical layers aren't meaningful on a flat
// schematic map); in/out do the same relative to south/north.
const DIRECTION_DELTA = {
  north: [0, -1],
  south: [0, 1],
  east: [1, 0],
  west: [-1, 0],
  up: [0, -1],
  down: [0, 1],
  in: [0, 1],
  out: [0, -1],
};

// Zork's real graph isn't planar (loops, one-way maze diodes, several
// rooms reachable two different ways with two different implied
// directions), so two rooms occasionally compute to the exact same grid
// cell, or close enough to it, to render as overlapping circles - e.g.
// West of House and the Living Room both land on (0,0) starting from
// this delta table. MIN_SEPARATION is chosen to comfortably clear two
// MapPanel node circles (radius 20px at 78px/cell - see MapPanel.jsx)
// rather than just checking for exact coordinate equality, so "close but
// not identical" collisions get nudged too.
const MIN_SEPARATION = 0.65;

function isFar(candidate, placedPoints) {
  return placedPoints.every(([px, py]) => {
    const dx = candidate[0] - px;
    const dy = candidate[1] - py;
    return dx * dx + dy * dy >= MIN_SEPARATION * MIN_SEPARATION;
  });
}

// A fixed handful of ring candidates isn't enough once a cluster gets
// dense (the house/Troll Room area has dozens of nudged rooms nearby by
// the time the Maze is reached) - every candidate in a small fixed ring
// can already be taken. A true expanding spiral (growing radius, more
// samples per ring) practically guarantees a free cell for a graph this
// size, and each successive ring stays close to the room's "correct"
// schematic position rather than jumping somewhere unrelated.
function nudgeToFreeCell(desired, placedPoints) {
  if (isFar(desired, placedPoints)) return desired;
  const [x, y] = desired;
  for (let ring = 1; ring <= 8; ring++) {
    const radius = MIN_SEPARATION * ring;
    const samples = 8 * ring;
    for (let i = 0; i < samples; i++) {
      const angle = (2 * Math.PI * i) / samples;
      const candidate = [x + radius * Math.cos(angle), y + radius * Math.sin(angle)];
      if (isFar(candidate, placedPoints)) return candidate;
    }
  }
  return desired; // give up and let it overlap - vanishingly unlikely with this few rooms
}

// A handful of real, reachable rooms have no `exits` edge into them at
// all - the only way there is a scripted verb (`rubMirror` in
// useGameState teleports between the two Mirror Rooms, not a normal
// direction). Without this, mirrorRoom1 and everything past it
// (Cold/Twisting Passage, the small cave) would never get a coordinate
// and MapPanel would crash the moment a player who found that route
// opened the map there. Modeled as an extra edge the BFS below treats
// exactly like a real exit, direction and all - which also means it
// draws as a real connecting line on the map, which is honest: it *is*
// a real, working connection, just not a directional one.
const EXTRA_EDGES = [{ from: 'mirrorRoom2', to: 'mirrorRoom1', dir: 'south' }];

function computeLayout(startId) {
  const coords = { [startId]: [0, 0] };
  // Real and maze-blob rooms are tracked separately: the 19 maze-blob
  // rooms cram into a small, densely looped subgraph and are never
  // individually rendered (see MAZE_NODE_ID), so two of them sitting
  // close to or on top of each other costs nothing - they don't need to
  // dodge each other. But maze1's coordinate *is* rendered (it's the
  // visible blob's own position), so every real room still needs to
  // dodge every maze room, not just other real rooms - otherwise a
  // maze room and a real room like South of House can land close enough
  // to overlap on the map.
  const realPoints = [[0, 0]];
  const mazePoints = [];
  const edgeKeys = new Set();
  const edges = [];
  const queue = [startId];
  const seen = new Set([startId]);

  const addEdge = (a, b) => {
    if (a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push([a, b]);
  };

  const place = (fromId, dir, target) => {
    addEdge(fromId, target);
    if (seen.has(target)) return;
    seen.add(target);
    const [x, y] = coords[fromId];
    const [dx, dy] = DIRECTION_DELTA[dir] || [0, 0];
    const targetIsMaze = isMazeRoom(target);
    // A maze room only needs to avoid real rooms; a real room needs to
    // avoid both, since it might be placed before or after maze1.
    const avoid = targetIsMaze ? realPoints : [...realPoints, ...mazePoints];
    const placed = nudgeToFreeCell([x + dx, y + dy], avoid);
    coords[target] = placed;
    (targetIsMaze ? mazePoints : realPoints).push(placed);
    queue.push(target);
  };

  while (queue.length > 0) {
    const id = queue.shift();
    const exits = ROOMS[id].exits || {};
    for (const [dir, target] of Object.entries(exits)) {
      if (!target) continue;
      place(id, dir, target);
    }
    for (const extra of EXTRA_EDGES) {
      if (extra.from === id) place(id, extra.dir, extra.to);
    }
  }

  return { coords, edges };
}

const { coords: ROOM_COORDS, edges: ROOM_EDGES } = computeLayout('westOfHouse');
export { ROOM_COORDS, ROOM_EDGES };

/**
 * Collapses every maze-blob room down to one synthetic 'maze' node
 * (positioned at maze1's own computed coordinate - the room actually
 * entered from the Troll Room) and drops any edge purely internal to the
 * blob, so the rendered map shows one node with real connections to
 * cyclopsRoom/gratingRoom rather than 19 indistinguishable dots.
 */
export function buildMapGraph() {
  const nodeCoords = { ...ROOM_COORDS, [MAZE_NODE_ID]: ROOM_COORDS.maze1 };
  const resolve = (id) => (isMazeRoom(id) ? MAZE_NODE_ID : id);

  const edgeKeys = new Set();
  const edges = [];
  for (const [a, b] of ROOM_EDGES) {
    const ra = resolve(a);
    const rb = resolve(b);
    if (ra === rb) continue;
    const key = ra < rb ? `${ra}|${rb}` : `${rb}|${ra}`;
    if (edgeKeys.has(key)) continue;
    edgeKeys.add(key);
    edges.push([ra, rb]);
  }

  return { nodeCoords, edges };
}
