import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const WALL_COLOR = '#4a4640';
const WALL_HEIGHT = 3;

const BUTTONS = [
  { name: 'blue', color: '#3a5fa0', x: -0.75 },
  { name: 'yellow', color: '#c8b030', x: -0.25 },
  { name: 'brown', color: '#6b4c33', x: 0.25 },
  { name: 'red', color: '#a03030', x: 0.75 },
];

function Button({ name, color, x, onInteract }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={[x, GROUND_Y + 1.4, -3.35]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract(`${name} button`, 'push');
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
        <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
        <meshStandardMaterial color={hovered ? '#ffffff' : color} />
      </mesh>
      <ObjectLabel text={`${name} button`} visible={hovered} position={[0, 0.35, 0]} />
    </group>
  );
}

function Wrench({ onInteract }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={[2.5, GROUND_Y + 0.05, -3]}>
      <mesh
        rotation={[0, 0.6, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onInteract('wrench', 'take');
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
        <boxGeometry args={[0.5, 0.06, 0.14]} />
        <meshStandardMaterial color={hovered ? '#e8e8e8' : '#9a9aa2'} />
      </mesh>
      <ObjectLabel text="wrench" visible={hovered} position={[0, 0.35, 0]} />
    </group>
  );
}

// Ransacked maintenance room, genuinely dark (no ONBIT in the source).
// The panel of four buttons is mounted on the wall ahead; the wrench
// (needed to turn the dam's bolt) sits on the floor until taken.
export default function MaintenanceRoom({ items, onInteract }) {
  return (
    <group>
      <Ground color="#3f3b35" size={7} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT / 2, -3.5]}>
        <boxGeometry args={[7, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      {BUTTONS.map((b) => (
        <Button key={b.name} name={b.name} color={b.color} x={b.x} onInteract={onInteract} />
      ))}
      {items.wrench.location === 'maintenanceRoom' && <Wrench onInteract={onInteract} />}
    </group>
  );
}
