import { useState } from 'react';

// HouseShell's box is centered at [0, 1, -8] with size [6, 4, 5], so its
// near face (the one facing the camera) sits at z = -8 + 5/2 = -5.5.
// Placing the pane at -5.49 sits it just proud of that face so it's
// visible instead of buried inside the solid box.
const WINDOW_HEIGHT = 2.2;
const WINDOW_Z = -5.49;

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
