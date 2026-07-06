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

      {/* protrude={false} keeps the stone blocks recessed within the
          wall's own thickness instead of poking past its face - the
          painting sits flush against this wall at z=-4.4, close enough
          that the default protruding blocks would clip through it. */}
      <DungeonWall
        position={[0, WALL_CENTER_Y, -4.5]}
        rotation={[0, Math.PI / 2, 0]}
        depth={9}
        height={WALL_HEIGHT}
        color={WALL_COLOR}
        protrude={false}
      />
      <DungeonWall position={[-4.5, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />
      <DungeonWall position={[4.5, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />

      {items.painting.location === 'gallery' && <Painting onInteract={onInteract} />}
    </group>
  );
}
