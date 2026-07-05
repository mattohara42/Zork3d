import { useState } from 'react';
import { GROUND_Y } from './Ground';
import { HOUSE_Z } from './HouseShell';

// HouseShell's box is centered at HOUSE_Z with depth 5, so its near face
// (the one facing the camera) sits at HOUSE_Z + 5/2. Placing the pane at
// HOUSE_Z + 2.51 sits it just proud of that face so it's visible instead
// of buried inside the solid box.
const WINDOW_HEIGHT = GROUND_Y + 2.2;
const WINDOW_Z = HOUSE_Z + 2.51;

/**
 * Behind House's window, set into the near face of the house shell.
 * Glassy blue while ajar/closed, a dark opening once pried open. Click
 * toggles it exactly like the mailbox.
 */
export default function WindowPane({ open, onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={[1.2, WINDOW_HEIGHT, WINDOW_Z]}
      onClick={(e) => {
        e.stopPropagation();
        onInteract('window', open ? 'close' : 'open');
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
      <planeGeometry args={[1, 1.2]} />
      <meshStandardMaterial
        color={open ? '#1a1a1a' : hovered ? '#d8f0f8' : '#bfe3f0'}
      />
    </mesh>
  );
}
