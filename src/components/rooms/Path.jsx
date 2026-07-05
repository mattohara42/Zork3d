import Ground, { GROUND_Y } from '../primitives/Ground';
import Tree from '../primitives/Tree';

// "One particularly large tree with some low branches stands at the
// edge of the path" - the tree you climb via the room's own `up` exit
// (no special click handling needed, same as any other direction).
export default function Path() {
  return (
    <group>
      <Ground color="#3a6b3a" />
      <group scale={1.7} position={[2.5, 0, -4.5]}>
        <Tree position={[0, GROUND_Y, 0]} />
      </group>
      <Tree position={[-3, GROUND_Y, -4]} />
      <Tree position={[-1, GROUND_Y, -6]} />
    </group>
  );
}
