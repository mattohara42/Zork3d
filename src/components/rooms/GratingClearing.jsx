import Ground, { GROUND_Y } from '../primitives/Ground';
import Tree from '../primitives/Tree';

// "A clearing, with a forest surrounding you on all sides" - open in the
// middle, trees pushed to the edges. The grate itself is real in canon
// but hidden until a leaf-clearing puzzle that isn't built yet, so
// nothing is rendered for it (matches `down` staying generically blocked
// in rooms.js rather than a fabricated permanent one).
export default function GratingClearing() {
  return (
    <group>
      <Ground color="#4a7a3a" size={8} />
      <Tree position={[-3.5, GROUND_Y, -5]} />
      <Tree position={[3.5, GROUND_Y, -5.5]} />
      <Tree position={[0, GROUND_Y, -6.5]} />
    </group>
  );
}
