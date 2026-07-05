import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import HouseShell from '../primitives/HouseShell';
import Mailbox from '../primitives/Mailbox';
import ObjectLabel from '../primitives/ObjectLabel';

// Dropped outside the mailbox (e.g. taken, then dropped in the open
// field) - a separate ground mesh from the one inside Mailbox.jsx, since
// that one is only for "still sitting in the mailbox".
function LeafletOnGround({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[1.2, GROUND_Y + 0.03, -3.5]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onInteract('leaflet', 'take');
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
        <planeGeometry args={[0.25, 0.18]} />
        <meshStandardMaterial color={hovered ? '#ffffff' : '#eeeee0'} />
      </mesh>
      <ObjectLabel text="leaflet" visible={hovered} position={[0, 0.3, 0]} />
    </group>
  );
}

export default function WestOfHouse({ flags, items, onInteract }) {
  return (
    <group>
      <Ground color="#3c8f3c" />
      <HouseShell />
      <Mailbox
        open={flags.mailboxOpen}
        hasLeaflet={items.leaflet.location === 'mailbox'}
        onInteract={onInteract}
      />
      {items.leaflet.location === 'westOfHouse' && <LeafletOnGround onInteract={onInteract} />}
    </group>
  );
}
