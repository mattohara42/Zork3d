import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const WALL_HEIGHT = 3;

// Same twisty-passage floor as the rest of the maze, but with a grate
// visible overhead - the one landmark room down here, matching its
// distinct text ("Above you is a grating..."). Clicking it attempts to
// open/close; unlocking still needs the typed "unlock grate" (requires
// the skeleton key), same two-step as the rest of the puzzle.
export default function GratingRoom({ flags, onInteract }) {
  const [hovered, setHovered] = useState(false);
  const open = flags.grateOpen;

  return (
    <group>
      <Ground color="#4a453e" size={7} />
      <mesh
        position={[0, GROUND_Y + WALL_HEIGHT, -1]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onInteract('grate', open ? 'close' : 'open');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[1.2, 1.2, 0.1]} />
        <meshStandardMaterial color={open ? '#8fae7a' : hovered ? '#4a4a4a' : '#2a2a2a'} wireframe={!open} />
      </mesh>
      <ObjectLabel text="grating" visible={hovered} position={[0, GROUND_Y + WALL_HEIGHT - 0.5, -1]} />
    </group>
  );
}
