import { useMemo } from 'react';
import { ROOMS } from '../gameData/rooms';
import { buildMapGraph, isMazeRoom, MAZE_NODE_ID } from '../gameData/mapLayout';

const CELL = 78;
const PADDING = 50;
const NODE_RADIUS = 20;

/**
 * Not a real geographic map - a schematic node/edge diagram built from
 * the same room graph the game itself runs on (see gameData/mapLayout.js).
 * Only fills in rooms the player has actually entered ("visitedRooms",
 * see useGameState) - nothing is shown ahead of discovery. The Maze
 * collapses to a single node until solved (real key to reappearing here:
 * the source's whole "twisty passages, all alike" trick is that they're
 * meant to be indistinguishable, so an accurate individual map for it
 * would just hand over the puzzle - see PROJECT_STATUS.md §2.8).
 */
export default function MapPanel({ visitedRooms, currentRoom, flags, onClose }) {
  const { nodeCoords, edges } = useMemo(() => buildMapGraph(), []);

  const mazeDiscovered = visitedRooms.some(isMazeRoom);
  const mazeSolved = visitedRooms.includes('cyclopsRoom') || flags.grateUnlocked;

  const resolveNode = (id) => (isMazeRoom(id) ? MAZE_NODE_ID : id);

  // visitedRooms is append-only in true discovery order (see
  // useGameState's currentRoom-tracking effect) - reusing that order to
  // stagger each node's reveal animation means the map visibly "grows"
  // in the same sequence the player actually explored it.
  const orderedNodeIds = [];
  const seenNodes = new Set();
  for (const roomId of visitedRooms) {
    const nodeId = resolveNode(roomId);
    if (seenNodes.has(nodeId)) continue;
    seenNodes.add(nodeId);
    orderedNodeIds.push(nodeId);
  }

  const visibleEdges = edges.filter(([a, b]) => seenNodes.has(a) && seenNodes.has(b));

  const xs = orderedNodeIds.map((id) => nodeCoords[id][0]);
  const ys = orderedNodeIds.map((id) => nodeCoords[id][1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = (maxX - minX) * CELL + PADDING * 2;
  const height = (maxY - minY) * CELL + PADDING * 2;

  const toPixel = ([x, y]) => [
    (x - minX) * CELL + PADDING,
    (y - minY) * CELL + PADDING,
  ];

  const currentNodeId = resolveNode(currentRoom);

  const nodeLabel = (id) => {
    if (id === MAZE_NODE_ID) return mazeSolved ? 'The Maze (found a way through)' : 'The Maze (uncharted)';
    return ROOMS[id].name;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      <style>{`
        @keyframes mapNodeIn {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes mapEdgeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#04120a',
          border: '1px solid #4caf50',
          borderRadius: 6,
          padding: 20,
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflow: 'auto',
          color: '#d8f5d8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, color: '#9fffa0' }}>Map</h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(20,40,20,0.8)',
              border: '1px solid #4caf50',
              color: '#d8f5d8',
              fontFamily: 'inherit',
              padding: '4px 10px',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: 13, opacity: 0.75 }}>
          You are here: <strong>{nodeLabel(currentNodeId)}</strong>
          {mazeDiscovered && !mazeSolved ? ' — the Maze stays uncharted until you find a way through it.' : ''}
        </p>
        <svg width={Math.max(width, 200)} height={Math.max(height, 200)} style={{ display: 'block' }}>
          {visibleEdges.map(([a, b], i) => {
            const [x1, y1] = toPixel(nodeCoords[a]);
            const [x2, y2] = toPixel(nodeCoords[b]);
            return (
              <line
                key={`${a}-${b}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4caf50"
                strokeOpacity={0.5}
                strokeWidth={2}
                style={{ animation: `mapEdgeIn 0.3s ease-out ${i * 12}ms both` }}
              />
            );
          })}
          {orderedNodeIds.map((id, i) => {
            const [x, y] = toPixel(nodeCoords[id]);
            const isCurrent = id === currentNodeId;
            const isMazeBlob = id === MAZE_NODE_ID;
            return (
              // Positioning (the translate attribute) and the entrance
              // animation (a CSS transform: scale) can't safely live on
              // the same <g> - a CSS `transform` style wins over the SVG
              // `transform` presentation attribute entirely, which
              // silently snapped every node back to the SVG's origin.
              // Nesting keeps the outer group's translate untouched by
              // the inner group's own, purely local-space CSS animation.
              <g key={id} transform={`translate(${x},${y})`}>
                <g style={{ animation: `mapNodeIn 0.35s ease-out ${i * 25}ms both`, transformOrigin: '0px 0px' }}>
                  <title>{nodeLabel(id)}</title>
                  <circle
                    r={NODE_RADIUS}
                    fill={isCurrent ? '#4caf50' : isMazeBlob ? '#3a2f1a' : '#0a2a12'}
                    stroke={isCurrent ? '#d8f5d8' : '#4caf50'}
                    strokeWidth={isCurrent ? 3 : 1.5}
                    strokeDasharray={isMazeBlob && !mazeSolved ? '4 3' : undefined}
                  />
                  <text
                    y={NODE_RADIUS + 12}
                    textAnchor="middle"
                    fontSize={10}
                    fill={isCurrent ? '#9fffa0' : '#8fd08f'}
                  >
                    {isMazeBlob ? (mazeSolved ? 'Maze ✓' : 'Maze ?') : truncate(ROOMS[id].name, 14)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
