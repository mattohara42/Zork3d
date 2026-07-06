import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const STONE_COLOR = '#8a8478';
const PILLAR_HEIGHT = 4.5;

function Pillar({ x }) {
  return (
    <mesh position={[x, GROUND_Y + PILLAR_HEIGHT / 2, -4]}>
      <cylinderGeometry args={[0.35, 0.4, PILLAR_HEIGHT, 10]} />
      <meshStandardMaterial color={STONE_COLOR} />
    </mesh>
  );
}

function Prayer({ onInteract }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={[2.6, GROUND_Y + 1.6, -3.4]} rotation={[0, -0.6, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('prayer', 'read');
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
        <boxGeometry args={[0.9, 0.7, 0.06]} />
        <meshStandardMaterial color={hovered ? '#c8b888' : '#a89868'} />
      </mesh>
      <ObjectLabel text="prayer" visible={hovered} position={[0, 0.5, 0]} />
    </group>
  );
}

// ONBIT + SACREDBIT in the source - lit, unlike its neighbors.
export default function NorthTemple({ onInteract }) {
  return (
    <group>
      <Ground color="#807a6c" size={9} />
      <Pillar x={-2.2} />
      <Pillar x={2.2} />
      <Prayer onInteract={onInteract} />
    </group>
  );
}
