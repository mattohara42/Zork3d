import Ground, { GROUND_Y } from '../primitives/Ground';
import Tree from '../primitives/Tree';

// "Trees in all directions" - dense, closer together than the sparser
// exterior-of-house rooms.
export default function Forest1() {
  return (
    <group>
      <Ground color="#2e5c2e" />
      <Tree position={[-3, GROUND_Y, -4]} />
      <Tree position={[2.5, GROUND_Y, -3.5]} />
      <Tree position={[0, GROUND_Y, -5.5]} />
      <Tree position={[-1.5, GROUND_Y, -3]} />
      <Tree position={[3.5, GROUND_Y, -6]} />
    </group>
  );
}
