import Ground, { GROUND_Y } from '../primitives/Ground';
import { ArchedDoorway } from '../3d/VisualKit';

const GATE_COLOR = '#2a2620';

// The gateway itself, barred by evil spirits - the exorcism ritual that
// gets you past it isn't modeled (see PROJECT_STATUS.md). "A large
// gateway" is literally what the source calls this, unlike South
// Temple's unconstrained background archway - ArchedDoorway's default
// near-black opening fits directly, this room is genuinely dark (no
// ONBIT), so no dim-stone override needed like South Temple's.
export default function EntranceToHades() {
  return (
    <group>
      <Ground color="#332e26" size={7} />
      <ArchedDoorway position={[0, GROUND_Y, -4]} width={2.4} height={3.2} thickness={0.4} color={GATE_COLOR} />
      {/* The "desolation" floor beyond, visible through the open gate. */}
      <mesh position={[0, GROUND_Y - 0.05, -5]}>
        <boxGeometry args={[3, 0.1, 1.2]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}
