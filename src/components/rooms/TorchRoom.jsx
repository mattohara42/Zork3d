import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const PEDESTAL_COLOR = '#d8d3c8';

function Pedestal({ items, onInteract }) {
  const [hovered, setHovered] = useState(false);
  const hasTorch = items.torch.location === 'torchRoom';

  return (
    <group position={[0, GROUND_Y, -3.5]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 1, 12]} />
        <meshStandardMaterial color={PEDESTAL_COLOR} />
      </mesh>
      {hasTorch && (
        <mesh
          position={[0, 1.1, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onInteract('torch', 'take');
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
          <coneGeometry args={[0.1, 0.5, 8]} />
          <meshStandardMaterial color={hovered ? '#ffb040' : '#e08820'} emissive="#a04000" emissiveIntensity={0.5} />
        </mesh>
      )}
      <ObjectLabel text="torch" visible={hovered} position={[0, 1.5, 0]} />
    </group>
  );
}

// The rope only shows once tied above (flags.domeFlag) - matches the
// Dome Room's own conditional line.
export default function TorchRoom({ flags, items, onInteract }) {
  return (
    <group>
      <Ground color="#4a4438" size={7} />
      <Pedestal items={items} onInteract={onInteract} />
      {flags.domeFlag && (
        <mesh position={[1.5, GROUND_Y + 2.2, -3]}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
          <meshStandardMaterial color="#8a7a5a" />
        </mesh>
      )}
    </group>
  );
}
