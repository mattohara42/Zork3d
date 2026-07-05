import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const WALL_COLOR = '#5f5648';
const WALL_HEIGHT = 3.2;

function Guidebook({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, GROUND_Y + 0.46, -3.3]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('guide', 'take');
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
        <boxGeometry args={[0.3, 0.05, 0.22]} />
        <meshStandardMaterial color={hovered ? '#d8c8a0' : '#c0b088'} />
      </mesh>
      <ObjectLabel text="guidebooks" visible={hovered} position={[0, 0.3, 0]} />
    </group>
  );
}

// The old dam tour's waiting room - a plain, disused lobby with the
// reception desk (holding the guidebooks, if not yet taken) against the
// back wall.
export default function DamLobby({ items, onInteract }) {
  return (
    <group>
      <Ground color="#544c40" size={8} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -3.8]}>
        <boxGeometry args={[8, WALL_HEIGHT, 0.3]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[0, GROUND_Y + 0.35, -3.3]}>
        <boxGeometry args={[2.4, 0.15, 0.5]} />
        <meshStandardMaterial color="#4a3d2c" />
      </mesh>
      {items.guide.location === 'damLobby' && <Guidebook onInteract={onInteract} />}
    </group>
  );
}
