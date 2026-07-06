import Ground, { GROUND_Y } from '../primitives/Ground';

const ROCK_COLOR = '#4a4438';

export default function SmallCave() {
  return (
    <group>
      <Ground color="#3f3a30" size={5} />
      <mesh position={[0.8, GROUND_Y + 0.45, -3.3]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={ROCK_COLOR} />
      </mesh>
      <mesh position={[-1.1, GROUND_Y + 0.35, -3.1]}>
        <dodecahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={ROCK_COLOR} />
      </mesh>
    </group>
  );
}
