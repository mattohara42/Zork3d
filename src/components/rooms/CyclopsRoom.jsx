import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#5a5248';
const WALL_HEIGHT = 3.2;

// A blocky low-poly cyclops, in the same style as the Troll - present
// until "ULYSSES" scares him off. STRENGTH 10000 in the source means
// he's unfightable, so unlike the troll he isn't clickable to attack.
function Cyclops() {
  return (
    <group position={[0, GROUND_Y, -3]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.1, 1.8, 0.8]} />
        <meshStandardMaterial color="#8a7a5a" />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#9a8a68" />
      </mesh>
      <mesh position={[0, 2.35, 0.36]}>
        <circleGeometry args={[0.15, 12]} />
        <meshStandardMaterial color="#c02020" />
      </mesh>
    </group>
  );
}

// Once fled, a cyclops-sized hole opens in the east wall instead - a
// hint of the Strange Passage beyond, not modeled as full depth.
function BrokenWall() {
  return <DungeonWall position={[4.5, GROUND_Y + WALL_HEIGHT / 2, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />;
}

function OpeningLabel() {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={[4.3, GROUND_Y + 1.2, 0]}>
      <mesh
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
        <boxGeometry args={[0.1, 1.4, 1.4]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <ObjectLabel text="opening" visible={hovered} position={[0, 1, 0]} />
    </group>
  );
}

export default function CyclopsRoom({ flags }) {
  return (
    <group>
      <Ground color="#4a4238" size={9} />
      <DungeonWall position={[-4.5, GROUND_Y + WALL_HEIGHT / 2, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />
      {flags.cyclopsFled ? <OpeningLabel /> : <BrokenWall />}
      {!flags.cyclopsFled && <Cyclops />}
    </group>
  );
}
