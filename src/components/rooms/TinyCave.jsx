import Ground, { GROUND_Y } from '../primitives/Ground';

const ROCK_COLOR = '#4a4438';

export default function TinyCave() {
  return (
    <group>
      <Ground color="#3f3a30" size={5} />
      <mesh position={[-1, GROUND_Y + 0.5, -3.2]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={ROCK_COLOR} />
      </mesh>
      <mesh position={[1.2, GROUND_Y + 0.4, -3.4]}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={ROCK_COLOR} />
      </mesh>
    </group>
  );
}
