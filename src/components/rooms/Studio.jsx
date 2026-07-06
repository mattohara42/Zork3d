import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#8a8070';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// A few mismatched paint-splatter colors on an otherwise plain wall -
// "splattered with paints of 69 different colors" doesn't need anything
// more literal than that.
const SPLATTERS = [
  { pos: [-2.5, GROUND_Y + 1.5, -4.4], color: '#c0392b', size: 0.6 },
  { pos: [-0.8, GROUND_Y + 2, -4.4], color: '#2980b9', size: 0.4 },
  { pos: [1.5, GROUND_Y + 1.2, -4.4], color: '#27ae60', size: 0.5 },
  { pos: [2.8, GROUND_Y + 2.1, -4.4], color: '#f1c40f', size: 0.35 },
];

function Fireplace() {
  return (
    <group position={[3, GROUND_Y, -3.5]}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.4, 1.2, 0.8]} />
        <meshStandardMaterial color="#4a4038" />
      </mesh>
      <mesh position={[0, 0.4, 0.1]}>
        <boxGeometry args={[0.7, 0.7, 0.5]} />
        <meshStandardMaterial color="#1a1512" />
      </mesh>
      {/* Chimney rising out of frame - the "dark and narrow chimney" up */}
      <mesh position={[0, 2, -0.1]}>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshStandardMaterial color="#3a332c" />
      </mesh>
    </group>
  );
}

function OwnersManual({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[-3, GROUND_Y + 1.4, -4.4]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('manual', 'take');
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
        <planeGeometry args={[0.3, 0.4]} />
        <meshStandardMaterial color={hovered ? '#ffffff' : '#eeeee0'} />
      </mesh>
      <ObjectLabel text="manual" visible={hovered} position={[0, 0.35, 0]} />
    </group>
  );
}

// Dark (no ONBIT in source). No wall on the south side - that's the open,
// paint-covered door back to the Gallery.
export default function Studio({ items, onInteract }) {
  return (
    <group>
      <Ground color="#726858" size={8} />

      {/* protrude={false}: the paint splatters below sit flush against
          this wall at z=-4.4, same clipping concern as Gallery's
          painting (see VisualKit.jsx). */}
      <DungeonWall
        position={[0, WALL_CENTER_Y, -4.5]}
        rotation={[0, Math.PI / 2, 0]}
        depth={8}
        height={WALL_HEIGHT}
        color={WALL_COLOR}
        protrude={false}
      />
      <DungeonWall position={[-4, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} depth={8} color={WALL_COLOR} />
      <DungeonWall position={[4, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} depth={8} color={WALL_COLOR} />

      {SPLATTERS.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <circleGeometry args={[s.size, 10]} />
          <meshStandardMaterial color={s.color} />
        </mesh>
      ))}

      <Fireplace />
      {items.ownersManual.location === 'studio' && <OwnersManual onInteract={onInteract} />}
    </group>
  );
}
