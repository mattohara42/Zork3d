import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_HEIGHT = 3;

// Same dark stone floor as MazeRoom, but with a wall of rock closing off
// the passage ahead - visually distinct from an open maze room, matching
// "you have come to a dead end" reading differently from "twisty little
// passages, all alike."
export default function MazeDeadEnd() {
  return (
    <group>
      <Ground color="#4a453e" size={7} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -4]}>
        <boxGeometry args={[6, WALL_HEIGHT, 1]} />
        <meshStandardMaterial color="#3a352f" />
      </mesh>
    </group>
  );
}
