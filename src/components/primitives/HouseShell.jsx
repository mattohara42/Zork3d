// The white house's box + roof are identical from every exterior room
// (only the ground color and props differ), so every exterior scene
// shares this instead of re-declaring the same meshes.
export default function HouseShell() {
  return (
    <group>
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[6, 4, 5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 4, -8]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.5, 2, 4]} />
        <meshStandardMaterial color="#8b4a3c" />
      </mesh>
    </group>
  );
}
