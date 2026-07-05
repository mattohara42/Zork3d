import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#6b5a42';
const WALL_HEIGHT = 3.2;

// "A number of discarded bags, which crumble at your touch" - the
// thief's hideaway, empty of loot since there's no thief NPC yet to
// have stashed anything here.
function Bag({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.3, 8, 6]} />
      <meshStandardMaterial color="#4a3d2c" />
    </mesh>
  );
}

export default function TreasureRoom() {
  return (
    <group>
      <Ground color="#5c4e38" size={8} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -4]}>
        <boxGeometry args={[8, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <Bag position={[-1.5, GROUND_Y + 0.2, -3]} />
      <Bag position={[1, GROUND_Y + 0.2, -3.3]} />
    </group>
  );
}
