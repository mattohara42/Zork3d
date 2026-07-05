import Ground from '../primitives/Ground';
import HouseShell from '../primitives/HouseShell';

export default function SouthOfHouseScene() {
  return (
    <group>
      <Ground color="#3c8f3c" />
      <HouseShell />
    </group>
  );
}
