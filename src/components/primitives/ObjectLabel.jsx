import { Html } from '@react-three/drei';

/**
 * A floating 2D label anchored to a point in 3D space, for naming
 * interactive objects (mailbox, window, ...). Deliberately plain HTML/CSS
 * text via drei's <Html> rather than generated 3D text geometry - much
 * cheaper, always crisp regardless of camera distance, and trivial to
 * style consistently with the rest of the UI.
 */
export default function ObjectLabel({ text, visible, position }) {
  if (!visible) return null;

  return (
    <Html position={position} center distanceFactor={8}>
      <div
        style={{
          background: 'rgba(4, 18, 10, 0.85)',
          border: '1px solid #4caf50',
          color: '#9fffa0',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 12,
          padding: '2px 8px',
          borderRadius: 3,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {text}
      </div>
    </Html>
  );
}
