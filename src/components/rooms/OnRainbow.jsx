import { GROUND_Y } from '../primitives/Ground';

const RAINBOW_COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];

// Standing on the (now solid) rainbow itself - the floor is a stack of
// rainbow-colored bands instead of plain ground.
export default function OnRainbow() {
  return (
    <group>
      {RAINBOW_COLORS.map((color, i) => (
        <mesh key={color} position={[0, GROUND_Y - i * 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7 - i * 0.6, 7 - i * 0.6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}
