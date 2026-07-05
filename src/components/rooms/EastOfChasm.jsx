import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#3a352f';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// Dark (no ONBIT in source). The chasm itself is just a dark void sunk
// into the floor ahead - "the bottom of which cannot be seen" is easy to
// sell with a plain black pit rather than modeled depth.
export default function EastOfChasm() {
  return (
    <group>
      <Ground color="#463f35" size={9} />

      {/* Set back from the camera so the lantern's cone lights visible
          ground in front of it - otherwise the pit fills the whole view
          and a lit room looks indistinguishable from pitch black. */}
      <mesh position={[0, GROUND_Y - 0.05, -6.5]}>
        <boxGeometry args={[6, 0.1, 3]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      <mesh position={[-4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
