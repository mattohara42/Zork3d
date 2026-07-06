import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';
import { TreasureChest } from '../3d/VisualKit';

const GOLD_COLOR = '#c8a838';
const GOLD_TRIM_COLOR = '#f0d878';

// Built from TreasureChest rather than a plain box - both the wood and
// trim colors are pushed to gold so the "solid-gold coffin" reads as
// gold overall, not a wood chest with gold accents. Click/hover stay on
// this wrapping group (TreasureChest itself has no interaction of its
// own) so the existing take/open dispatch didn't need to change at all.
function Coffin({ items, onInteract }) {
  const [hovered, setHovered] = useState(false);
  const open = items.sceptre.location !== 'insideCoffin';

  return (
    <group position={[0, GROUND_Y, -3.5]}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onInteract('coffin', open ? 'take' : 'open');
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
        <TreasureChest
          width={1.6}
          depth={0.7}
          baseHeight={0.5}
          isOpen={open}
          woodColor={GOLD_COLOR}
          goldColor={GOLD_TRIM_COLOR}
        />
      </group>
      <ObjectLabel text="coffin" visible={hovered} position={[0, 0.9, 0]} />
    </group>
  );
}

function Sceptre({ items, onInteract }) {
  const [hovered, setHovered] = useState(false);
  if (items.sceptre.location !== 'egyptRoom') return null;

  return (
    <group position={[1.3, GROUND_Y + 0.05, -3.2]} rotation={[0, 0.4, 0]}>
      <mesh
        rotation={[0, 0, Math.PI / 2.4]}
        onClick={(e) => {
          e.stopPropagation();
          onInteract('sceptre', 'take');
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
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color={hovered ? '#ffe680' : '#d4af37'} />
      </mesh>
      <ObjectLabel text="sceptre" visible={hovered} position={[0, 0.3, 0]} />
    </group>
  );
}

export default function EgyptRoom({ items, onInteract }) {
  return (
    <group>
      <Ground color="#453f30" size={7} />
      {items.coffin.location === 'egyptRoom' && <Coffin items={items} onInteract={onInteract} />}
      <Sceptre items={items} onInteract={onInteract} />
    </group>
  );
}
