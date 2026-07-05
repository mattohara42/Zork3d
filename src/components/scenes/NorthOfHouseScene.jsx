import Ground from '../primitives/Ground';
import HouseShell from '../primitives/HouseShell';
import Tree from '../primitives/Tree';

export default function NorthOfHouseScene() {
  return (
    <group>
      <Ground color="#357a35" />
      <HouseShell />
      <Tree position={[-5, -1, -4]} />
      <Tree position={[5, -1, -3]} />
    </group>
  );
}
