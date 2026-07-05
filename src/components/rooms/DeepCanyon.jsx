import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#7a6a54';
const WALL_HEIGHT = 5;

// South side of a deep canyon with a small stream running through it -
// the canyon itself is a dark gap sunk into the floor, same trick used
// for the Chasm. Dark room (RLANDBIT only, no ONBIT in the source) -
// needs the lamp like the rest of this hub.
export default function DeepCanyon() {
  return (
    <group>
      <Ground color="#6f6350" size={9} />
      <mesh position={[0, GROUND_Y - 0.05, -4]}>
        <boxGeometry args={[8, 0.1, 2]} />
        <meshStandardMaterial color="#25405a" />
      </mesh>
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -6]}>
        <boxGeometry args={[9, WALL_HEIGHT, 1]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
