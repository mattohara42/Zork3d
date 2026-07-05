import Ground, { GROUND_Y } from '../primitives/Ground';
import HouseShell from '../primitives/HouseShell';
import Tree from '../primitives/Tree';

export default function NorthOfHouseScene() {
  return (
    <group>
      <Ground color="#357a35" />
      <HouseShell />
      <Tree position={[-4, GROUND_Y, -6]} />
      <Tree position={[4.5, GROUND_Y, -5]} />
      <Tree position={[-3, GROUND_Y, -2]} />
    </group>
  );
}
