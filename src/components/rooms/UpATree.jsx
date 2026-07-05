import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const LEAF_COLOR = '#2e6b2e';

// You're not standing on the forest floor here, you're perched among
// branches 10 feet up - reuses Ground (same reasoning every other room
// relies on: the fixed camera needs *something* at GROUND_Y to read as
// solid), just recolored to a branch/bark tone instead of grass.
function Branch() {
  return <Ground color="#5a4530" size={7} />;
}

function LeafCluster({ position, size }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color={LEAF_COLOR} />
    </mesh>
  );
}

function Nest({ items, onInteract }) {
  const [hovered, setHovered] = useState(false);
  const hasEgg = items.egg.location === 'upATree';

  return (
    <group position={[0.8, GROUND_Y + 0.15, -3.6]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.1, 8, 16]} />
        <meshStandardMaterial color="#8a6a42" />
      </mesh>
      {hasEgg && (
        <mesh
          position={[0, 0.15, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onInteract('egg', 'take');
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
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color={hovered ? '#ffd700' : '#c9a227'} />
        </mesh>
      )}
      <ObjectLabel text="egg" visible={hovered} position={[0, 0.6, 0]} />
    </group>
  );
}

export default function UpATree({ items, onInteract }) {
  return (
    <group>
      <Branch />
      <LeafCluster position={[-2, GROUND_Y + 1.5, -3]} size={1.4} />
      <LeafCluster position={[2, GROUND_Y + 1.8, -4]} size={1.6} />
      <LeafCluster position={[0, GROUND_Y + 2.5, -5]} size={1.8} />
      <LeafCluster position={[-2.5, GROUND_Y + 0.8, -5]} size={1.2} />
      <Nest items={items} onInteract={onInteract} />
    </group>
  );
}
