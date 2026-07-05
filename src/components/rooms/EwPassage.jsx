import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#3d3833';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// Dark, narrow east-west passage with a stairway down at the north end -
// both "down" and "north" lead to the Chasm in this simplified graph.
// Side walls stand in for the "narrow" framing (same trick as NS-Passage)
// so the lantern has something nearby to catch, rather than lighting an
// empty floor plane.
export default function EwPassage() {
  return (
    <group>
      <Ground color="#41392f" size={7} />
      <mesh position={[-2, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 7]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[2, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 7]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
