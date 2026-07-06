import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const RAINBOW_COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];

// "A rainbow crosses over the falls to the east" - concentric partial
// rings standing in for the arc, plus a strip of river along the back.
function Rainbow() {
  return (
    <group position={[3, GROUND_Y + 1, -5]}>
      {RAINBOW_COLORS.map((color, i) => (
        <mesh key={color} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.4 + i * 0.15, 0.07, 8, 24, Math.PI]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// Only appears once the sceptre has been waved here (flags.rainbowFlag).
function PotOfGold({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[-1.3, GROUND_Y + 0.05, -3.2]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('pot of gold', 'take');
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
        <cylinderGeometry args={[0.28, 0.22, 0.3, 12]} />
        <meshStandardMaterial color={hovered ? '#ffd700' : '#c9a227'} />
      </mesh>
      <ObjectLabel text="pot of gold" visible={hovered} position={[0, 0.5, 0]} />
    </group>
  );
}

export default function EndOfRainbow({ items, onInteract }) {
  return (
    <group>
      <Ground color="#c9b896" size={7} />
      <mesh position={[0, GROUND_Y + 0.02, -6]}>
        <boxGeometry args={[7, 0.05, 2]} />
        <meshStandardMaterial color="#3a6a8a" />
      </mesh>
      <Rainbow />
      {items.potOfGold.location === 'endOfRainbow' && <PotOfGold onInteract={onInteract} />}
    </group>
  );
}
