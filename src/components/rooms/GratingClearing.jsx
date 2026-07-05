import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import Tree from '../primitives/Tree';
import ObjectLabel from '../primitives/ObjectLabel';

function LeafPile({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[1, GROUND_Y + 0.1, -3.5]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('leaves', 'take');
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
        <sphereGeometry args={[0.45, 10, 6]} />
        <meshStandardMaterial color={hovered ? '#c9a24a' : '#a8822f'} />
      </mesh>
      <ObjectLabel text="leaves" visible={hovered} position={[0, 0.5, 0]} />
    </group>
  );
}

function Grate({ open, onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[-1, GROUND_Y + 0.03, -3.8]}>
      <mesh
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
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={open ? '#050505' : hovered ? '#5a5a5a' : '#3a3a3a'} wireframe={!open} />
      </mesh>
      <ObjectLabel text="grating" visible={hovered} position={[0, 0.3, 0]} />
    </group>
  );
}

// "A clearing, with a forest surrounding you on all sides" - open in the
// middle, trees pushed to the edges.
export default function GratingClearing({ flags, items, onInteract }) {
  return (
    <group>
      <Ground color="#4a7a3a" size={8} />
      <Tree position={[-3.5, GROUND_Y, -5]} />
      <Tree position={[3.5, GROUND_Y, -5.5]} />
      <Tree position={[0, GROUND_Y, -6.5]} />
      {items.leaves.location === 'gratingClearing' && <LeafPile onInteract={onInteract} />}
      {flags.grateRevealed && <Grate open={flags.grateOpen} onInteract={onInteract} />}
    </group>
  );
}
