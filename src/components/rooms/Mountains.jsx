import Ground, { GROUND_Y } from '../primitives/Ground';
import Tree from '../primitives/Tree';

// "The forest thins out, revealing impassable mountains" - fewer trees,
// grey peaks filling the horizon in place of more forest.
function MountainPeak({ position, size }) {
  return (
    <mesh position={position}>
      <coneGeometry args={[size, size * 1.8, 4]} />
      <meshStandardMaterial color="#7a7d82" />
    </mesh>
  );
}

export default function Mountains() {
  return (
    <group>
      <Ground color="#5c5c48" />
      <Tree position={[-3, GROUND_Y, -3]} />
      <Tree position={[3, GROUND_Y, -3.5]} />
      <MountainPeak position={[-3, GROUND_Y + 3, -12]} size={4} />
      <MountainPeak position={[1, GROUND_Y + 4, -14]} size={5.5} />
      <MountainPeak position={[5, GROUND_Y + 2.5, -11]} size={3.5} />
    </group>
  );
}
