import Ground, { GROUND_Y } from '../primitives/Ground';
import Tree from '../primitives/Tree';

// A second, distinct room also literally named "Clearing" in the source
// - "a small clearing in a well marked forest path that extends to the
// east and west."
export default function Clearing() {
  return (
    <group>
      <Ground color="#4a7a3a" size={8} />
      <Tree position={[-3, GROUND_Y, -4.5]} />
      <Tree position={[3, GROUND_Y, -4]} />
      <Tree position={[1, GROUND_Y, -6.5]} />
    </group>
  );
}
