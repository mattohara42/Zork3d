import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const DAM_COLOR = '#8a8a82';
const WALL_HEIGHT = 5;

// The control panel's bolt - clicking it fires the same 'turn' dispatch
// as typing "turn bolt with wrench". The panel/bubble are decorative;
// their bit-glow state isn't distinguishable from a static color at this
// scale, so flags aren't threaded into the visuals here.
function Bolt({ onInteract }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={[1.8, GROUND_Y + 1.2, -5.1]}>
      <mesh>
        <boxGeometry args={[0.9, 1.1, 0.15]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      <mesh
        position={[0, 0, 0.15]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onInteract('bolt', 'turn');
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
        <cylinderGeometry args={[0.14, 0.14, 0.12, 8]} />
        <meshStandardMaterial color={hovered ? '#c8b060' : '#a89050'} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.35, 0.12]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#7ab87a" transparent opacity={0.6} />
      </mesh>
      <ObjectLabel text="bolt" visible={hovered} position={[0, -0.8, 0]} />
    </group>
  );
}

// Flood Control Dam #3 - a massive concrete wall filling the north side
// of the room, with the control panel mounted on it. The reservoir/
// sluice-gate machinery beyond isn't modeled in any more depth than the
// room text describes.
export default function DamRoom({ onInteract }) {
  return (
    <group>
      <Ground color="#5a5850" size={9} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -6]}>
        <boxGeometry args={[9, WALL_HEIGHT, 1.5]} />
        <meshStandardMaterial color={DAM_COLOR} />
      </mesh>
      <Bolt onInteract={onInteract} />
    </group>
  );
}
