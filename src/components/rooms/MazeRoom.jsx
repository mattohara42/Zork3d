import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

// "This is part of a maze of twisty little passages, all alike" is the
// joke - every maze room uses this same component. A tiny per-room seed
// (from the room id) varies rock placement just enough that it doesn't
// look like a single frozen frame reused verbatim, without giving the
// player any real visual landmark to navigate by (that would defeat the
// point of the puzzle).
function seededRocks(seed, count) {
  let n = seed;
  const next = () => {
    n = (n * 1103515245 + 12345) & 0x7fffffff;
    return n / 0x7fffffff;
  };
  return Array.from({ length: count }, () => ({
    position: [(next() - 0.5) * 6, GROUND_Y + next() * 0.3, -3 - next() * 3],
    size: 0.3 + next() * 0.4,
  }));
}

// Maze-5 only: the skeleton is flavor (NDESCBIT in the source - no
// separate takeable item), but the skeleton key beside it is real and
// takeable.
function Skeleton({ items, onInteract }) {
  const [hovered, setHovered] = useState(false);
  const hasKeys = items.keys.location === 'maze5';

  return (
    <group position={[-1.5, GROUND_Y + 0.05, -3.5]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.1, 0.35, 0.02]} />
        <meshStandardMaterial color="#d8d0bc" />
      </mesh>
      {hasKeys && (
        <mesh
          position={[0.5, 0.03, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onInteract('key', 'take');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <torusGeometry args={[0.12, 0.03, 6, 12]} />
          <meshStandardMaterial color={hovered ? '#e8c66a' : '#b8952f'} />
        </mesh>
      )}
      <ObjectLabel text="skeleton key" visible={hovered} position={[0.5, 0.3, 0]} />
    </group>
  );
}

export default function MazeRoom({ roomId, items, onInteract }) {
  const seed = roomId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) || 1;
  const rocks = seededRocks(seed, 4);

  return (
    <group>
      <Ground color="#4a453e" size={8} />
      {rocks.map((rock, i) => (
        <mesh key={i} position={rock.position}>
          <dodecahedronGeometry args={[rock.size, 0]} />
          <meshStandardMaterial color="#5c564c" />
        </mesh>
      ))}
      {roomId === 'maze5' && <Skeleton items={items} onInteract={onInteract} />}
    </group>
  );
}
