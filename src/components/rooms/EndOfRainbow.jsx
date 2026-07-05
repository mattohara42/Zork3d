import Ground, { GROUND_Y } from '../primitives/Ground';

const RAINBOW_COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];

// "A rainbow crosses over the falls to the east" - concentric partial
// rings standing in for the arc, plus a strip of river along the back.
function Rainbow() {
  return (
    <group position={[3, GROUND_Y + 1, -5]}>
      {RAINBOW_COLORS.map((color, i) => (
        <mesh key={color} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.4 + i * 0.15, 0.07, 8, 24, Math.PI]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

export default function EndOfRainbow() {
  return (
    <group>
      <Ground color="#c9b896" size={7} />
      <mesh position={[0, GROUND_Y + 0.02, -6]}>
        <boxGeometry args={[7, 0.05, 2]} />
        <meshStandardMaterial color="#3a6a8a" />
      </mesh>
      <Rainbow />
    </group>
  );
}
