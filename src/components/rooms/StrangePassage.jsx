import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_HEIGHT = 3;

// "A long passage" between the Cyclops Room and the Living Room - the
// famous shortcut once the cyclops has fled.
export default function StrangePassage() {
  return (
    <group>
      <Ground color="#4a4238" size={9} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -4.5]}>
        <boxGeometry args={[3, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#4a3521" />
      </mesh>
    </group>
  );
}
