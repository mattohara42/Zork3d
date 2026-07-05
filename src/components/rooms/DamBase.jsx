import Ground, { GROUND_Y } from '../primitives/Ground';

const CLIFF_COLOR = '#c8c0aa';
const WALL_HEIGHT = 7;

// Base of Flood Control Dam #3, with the White Cliffs along the river
// Frigid - reusing the dark-water-strip trick for the river itself, with
// tall pale cliff walls framing it.
export default function DamBase() {
  return (
    <group>
      <Ground color="#5a5648" size={10} />
      <mesh position={[0, GROUND_Y - 0.05, -4.5]}>
        <boxGeometry args={[10, 0.1, 3]} />
        <meshStandardMaterial color="#2a4a68" />
      </mesh>
      <mesh position={[-5, GROUND_Y + WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.6, WALL_HEIGHT, 10]} />
        <meshStandardMaterial color={CLIFF_COLOR} />
      </mesh>
      <mesh position={[5, GROUND_Y + WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.6, WALL_HEIGHT, 10]} />
        <meshStandardMaterial color={CLIFF_COLOR} />
      </mesh>
    </group>
  );
}
