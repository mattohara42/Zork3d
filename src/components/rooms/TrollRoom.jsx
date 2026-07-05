import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#3f3a35';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// Low-poly troll: a blocky silhouette rather than anything articulated -
// there's no combat system yet, so it's a fixture blocking the room, not
// an animated actor.
function Troll() {
  return (
    <group position={[0, GROUND_Y, -3]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.9, 1.4, 0.6]} />
        <meshStandardMaterial color="#4a5a3a" />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[0.55, 0.5, 0.5]} />
        <meshStandardMaterial color="#556b45" />
      </mesh>
      {/* Axe */}
      <mesh position={[0.65, 1.1, 0.1]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 1.3, 0.08]} />
        <meshStandardMaterial color="#5a4a3a" />
      </mesh>
      <mesh position={[0.75, 1.65, 0.1]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.35, 0.3, 0.05]} />
        <meshStandardMaterial color="#8a8f96" />
      </mesh>
    </group>
  );
}

// Also dark (no ONBIT in source) - same lighting split as the Cellar. No
// wall directly ahead (-Z) since that's where the troll itself is; the
// side walls stand in for the blocked east/west passages and the
// forbidding hole west.
export default function TrollRoom() {
  return (
    <group>
      <Ground color="#332e28" size={9} />

      <mesh position={[-4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      <Troll />
    </group>
  );
}
