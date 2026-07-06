import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#4a4438';
const WALL_HEIGHT = 3;

export default function EngravingsCave() {
  return (
    <group>
      <Ground color="#413c30" size={6} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -3.8]}>
        <boxGeometry args={[6, WALL_HEIGHT, 0.3]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
