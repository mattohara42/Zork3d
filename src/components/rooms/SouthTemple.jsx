import Ground, { GROUND_Y } from '../primitives/Ground';

const STONE_COLOR = '#8a8478';

// ONBIT + SACREDBIT - lit. The hole in the corner (down to Tiny Cave,
// gated on not carrying the coffin - see rooms.js) is a dark patch in
// the floor, same trick used for the Chasm/Dome Room pits.
export default function SouthTemple() {
  return (
    <group>
      <Ground color="#807a6c" size={7} />
      <mesh position={[0, GROUND_Y + 0.5, -3.5]}>
        <boxGeometry args={[1.6, 1, 0.8]} />
        <meshStandardMaterial color={STONE_COLOR} />
      </mesh>
      <mesh position={[-2.4, GROUND_Y - 0.04, -3.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}
