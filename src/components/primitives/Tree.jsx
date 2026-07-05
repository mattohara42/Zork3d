export default function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
        <meshStandardMaterial color="#5a3a2a" />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.8, 1.8, 6]} />
        <meshStandardMaterial color="#2e6b2e" />
      </mesh>
    </group>
  );
}
