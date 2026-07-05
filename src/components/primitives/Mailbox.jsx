import { useState } from 'react';
import { GROUND_Y } from './Ground';
import ObjectLabel from './ObjectLabel';

const X = 2;
const Z = -3;

/**
 * The one clickable object in West of House. onClick fires
 * interactWithObject('mailbox', <open|close>) directly from the mesh,
 * per the click-interaction requirement - no separate hit-testing layer.
 */
export default function Mailbox({ open, hasLeaflet, onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group>
      <mesh
        position={[X, GROUND_Y + 0.85, Z]}
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

      <mesh position={[X, GROUND_Y + 0.3, Z]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#5a3a2a" />
      </mesh>

      {/* Lid - flat when closed, flipped up against the back when open */}
      <mesh
        position={open ? [X, GROUND_Y + 1.15, Z - 0.13] : [X, GROUND_Y + 1.13, Z]}
        rotation={open ? [Math.PI / 2.2, 0, 0] : [0, 0, 0]}
      >
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#8b1f1f" />
      </mesh>

      {open && hasLeaflet && (
        <mesh position={[X, GROUND_Y + 0.8, Z]}>
          <boxGeometry args={[0.25, 0.02, 0.18]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}

      <ObjectLabel text="mailbox" visible={hovered} position={[X, GROUND_Y + 1.5, Z]} />
    </group>
  );
}
