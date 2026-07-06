import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#4a453c';
const WALL_HEIGHT = 3.4;

// Shared by both Mirror Room 1 (dark) and Mirror Room 2 (lit) - same
// MIRROR-ROOM description/ACTION in the source. Clicking the mirror
// rubs it, teleporting between the two (MIRROR-MIRROR, simplified - see
// PROJECT_STATUS.md).
function Mirror({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, GROUND_Y + 1.4, -4.3]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('mirror', 'rub');
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
        <boxGeometry args={[3, 2.2, 0.08]} />
        <meshStandardMaterial color={hovered ? '#dfe8f0' : '#b8c4cc'} metalness={0.8} roughness={0.15} />
      </mesh>
      <ObjectLabel text="mirror" visible={hovered} position={[0, 1.4, 0]} />
    </group>
  );
}

export default function MirrorRoom({ onInteract }) {
  return (
    <group>
      <Ground color="#524c40" size={8} />
      <DungeonWall position={[-4, GROUND_Y + WALL_HEIGHT / 2, 0]} height={WALL_HEIGHT} depth={8} color={WALL_COLOR} />
      <DungeonWall position={[4, GROUND_Y + WALL_HEIGHT / 2, 0]} height={WALL_HEIGHT} depth={8} color={WALL_COLOR} />
      <Mirror onInteract={onInteract} />
    </group>
  );
}
