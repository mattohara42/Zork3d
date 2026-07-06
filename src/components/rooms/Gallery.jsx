import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#d8d3c8';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

function Painting({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, GROUND_Y + 1.6, -4.4]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('painting', 'take');
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
        <boxGeometry args={[1.4, 1, 0.08]} />
        <meshStandardMaterial color={hovered ? '#b8925a' : '#8a6a3a'} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.1, 0.7]} />
        <meshStandardMaterial color="#c9a876" />
      </mesh>
      <ObjectLabel text="painting" visible={hovered} position={[0, 0.8, 0]} />
    </group>
  );
}

// Unlike the Cellar/Troll Room/Studio, the Gallery has ONBIT in the
// source - it's lit normally despite being this deep underground, so it
// uses the same daylight-style lighting rig as the surface rooms.
export default function Gallery({ items, onInteract }) {
  return (
    <group>
      <Ground color="#a89f8c" size={9} />

      {/* Back wall stays plain, not DungeonWall - its stone blocks would
          protrude enough to clip through the painting sitting flush
          against it at z=-4.4. */}
      <mesh position={[0, WALL_CENTER_Y, -4.5]}>
        <boxGeometry args={[9, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <DungeonWall position={[-4.5, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />
      <DungeonWall position={[4.5, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />

      {items.painting.location === 'gallery' && <Painting onInteract={onInteract} />}
    </group>
  );
}
