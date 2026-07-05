import Ground, { GROUND_Y } from '../primitives/Ground';
import Tree from '../primitives/Tree';

// Same LDESC as Forest2 in the source ("dimly lit forest, with large
// trees all around") - kept visually distinct only by tree layout.
export default function Forest3() {
  return (
    <group>
      <Ground color="#264d26" />
      <Tree position={[2, GROUND_Y, -3.5]} />
      <Tree position={[-3, GROUND_Y, -4.5]} />
      <Tree position={[-0.5, GROUND_Y, -6]} />
      <Tree position={[4, GROUND_Y, -5]} />
    </group>
  );
}
