import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#5f5648';
const WALL_HEIGHT = 3.2;

// The old dam tour's waiting room - a plain, disused lobby with a bench
// against the back wall.
export default function DamLobby() {
  return (
    <group>
      <Ground color="#544c40" size={8} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -3.8]}>
        <boxGeometry args={[8, WALL_HEIGHT, 0.3]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[0, GROUND_Y + 0.35, -3.3]}>
        <boxGeometry args={[2.4, 0.15, 0.5]} />
        <meshStandardMaterial color="#4a3d2c" />
      </mesh>
    </group>
  );
}
