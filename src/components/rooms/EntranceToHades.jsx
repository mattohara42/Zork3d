import Ground, { GROUND_Y } from '../primitives/Ground';

const GATE_COLOR = '#2a2620';

// The gateway itself, barred by evil spirits - the exorcism ritual that
// gets you past it isn't modeled (see PROJECT_STATUS.md).
export default function EntranceToHades() {
  return (
    <group>
      <Ground color="#332e26" size={7} />
      <mesh position={[-1.4, GROUND_Y + 1.6, -4]}>
        <boxGeometry args={[0.4, 3.2, 0.4]} />
        <meshStandardMaterial color={GATE_COLOR} />
      </mesh>
      <mesh position={[1.4, GROUND_Y + 1.6, -4]}>
        <boxGeometry args={[0.4, 3.2, 0.4]} />
        <meshStandardMaterial color={GATE_COLOR} />
      </mesh>
      <mesh position={[0, GROUND_Y + 3.2, -4]}>
        <boxGeometry args={[3.2, 0.4, 0.4]} />
        <meshStandardMaterial color={GATE_COLOR} />
      </mesh>
      <mesh position={[0, GROUND_Y - 0.05, -5]}>
        <boxGeometry args={[3, 0.1, 1.2]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}
