import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#39433d';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// Dark, damp cave narrowing to an impassable crack to the south
// ("too narrow for most insects").
export default function DampCave() {
  return (
    <group>
      <Ground color="#33362f" size={7} />
      <mesh position={[0, WALL_CENTER_Y, -3.4]}>
        <boxGeometry args={[1.2, WALL_HEIGHT, 0.3]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
