import Ground, { GROUND_Y } from '../primitives/Ground';

// "A marvelous view of the canyon" - a rocky overlook edge with the far
// canyon wall visible across the gap, rather than modeled depth.
function FarWall({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#a0715a" />
    </mesh>
  );
}

export default function CanyonView() {
  return (
    <group>
      <Ground color="#8a9a6a" size={8} />
      <mesh position={[0, GROUND_Y - 0.05, -5]}>
        <boxGeometry args={[6, 0.1, 3]} />
        <meshStandardMaterial color="#5a6b7a" />
      </mesh>
      <FarWall position={[0, GROUND_Y + 2, -9]} size={[10, 6, 1]} />
    </group>
  );
}
