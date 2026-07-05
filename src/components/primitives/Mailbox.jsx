import { useState } from 'react';
import { GROUND_Y } from './Ground';

/**
 * The one clickable object in West of House. onClick fires
 * interactWithObject('mailbox', <open|close>) directly from the mesh,
 * per the click-interaction requirement - no separate hit-testing layer.
 */
export default function Mailbox({ open, hasLeaflet, onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[3, GROUND_Y + 0.4, -2]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('mailbox', open ? 'close' : 'open');
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
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color={hovered ? '#d24444' : '#aa2222'} />
      </mesh>

      {/* Lid - flat when closed, flipped up when open */}
      <mesh
        position={open ? [0, 0.4, -0.13] : [0, 0.38, 0]}
        rotation={open ? [Math.PI / 2.2, 0, 0] : [0, 0, 0]}
      >
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#8b1f1f" />
      </mesh>

      {open && hasLeaflet && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.25, 0.02, 0.18]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
}
