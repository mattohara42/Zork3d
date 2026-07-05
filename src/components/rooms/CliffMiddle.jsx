import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#8a6f5a';
const WALL_HEIGHT = 4;

// "A ledge about halfway up the wall of the river canyon" - a narrow
// rock shelf, with a sheer cliff face rising behind it.
export default function CliffMiddle() {
  return (
    <group>
      <Ground color="#79654f" size={5} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -3.5]}>
        <boxGeometry args={[9, WALL_HEIGHT, 0.5]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
