import Ground, { GROUND_Y } from '../primitives/Ground';
import Tree from '../primitives/Tree';

// "Dimly lit forest, with large trees all around" - same daylight rig as
// every other surface room (no darkness mechanic here), just a darker
// ground tone and denser canopy to read as gloomier.
export default function Forest2() {
  return (
    <group>
      <Ground color="#264d26" />
      <Tree position={[-2.5, GROUND_Y, -3.5]} />
      <Tree position={[3, GROUND_Y, -4]} />
      <Tree position={[0.5, GROUND_Y, -6]} />
      <Tree position={[-4, GROUND_Y, -5.5]} />
    </group>
  );
}
