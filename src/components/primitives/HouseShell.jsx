import { GROUND_Y } from './Ground';

// 10 units ahead of the fixed origin camera - close enough to read clearly
// in first person, far enough that the whole roofline fits in frame.
export const HOUSE_Z = -10;

// The white house's box + roof are identical from every exterior room
// (only the ground color and props differ), so every exterior scene
// shares this instead of re-declaring the same meshes.
export default function HouseShell() {
  return (
    <group>
      <mesh position={[0, GROUND_Y + 2, HOUSE_Z]}>
        <boxGeometry args={[6, 4, 5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, GROUND_Y + 5, HOUSE_Z]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.5, 2, 4]} />
        <meshStandardMaterial color="#8b4a3c" />
      </mesh>
    </group>
  );
}
