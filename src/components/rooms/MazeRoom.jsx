import Ground, { GROUND_Y } from '../primitives/Ground';

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

export default function MazeRoom({ roomId }) {
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
    </group>
  );
}
