import Ground, { GROUND_Y } from '../primitives/Ground';

const RUBBLE_COLOR = '#4a4238';
const WALL_HEIGHT = 3.4;

// Circular hub room - several passages "blocked by cave-ins" (the south
// exit toward the Temple network, not modeled yet). A rubble pile stands
// in for one of the collapsed passages rather than a literal circular wall.
export default function RoundRoom() {
  return (
    <group>
      <Ground color="#4f473c" size={9} />
      <mesh position={[0, GROUND_Y + 0.4, -3.2]}>
        <coneGeometry args={[1.4, 0.9, 6]} />
        <meshStandardMaterial color={RUBBLE_COLOR} />
      </mesh>
      <mesh position={[-1.6, GROUND_Y + WALL_HEIGHT / 2, -3.4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, WALL_HEIGHT, 0.3]} />
        <meshStandardMaterial color={RUBBLE_COLOR} />
      </mesh>
    </group>
  );
}
