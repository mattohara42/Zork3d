import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#4a453f';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// Cellar is almost always seen either pitch black or by dim lantern light
// (see ViewportCanvas's isDark/isUnderground split), so geometry here is
// deliberately plain - it reads as a shape caught by the spotlight rather
// than something meant to be examined in bright daylight. No wall directly
// ahead (-Z) - that's the narrow passageway leading north to the Troll Room.
export default function CellarScene() {
  return (
    <group>
      <Ground color="#3a3226" size={9} />

      <mesh position={[4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* The unclimbable metal ramp, against the west wall */}
      <mesh position={[-3.5, GROUND_Y + 0.9, -1.5]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[2.6, 0.15, 1.6]} />
        <meshStandardMaterial color="#8a8f96" />
      </mesh>
      <mesh position={[-4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
