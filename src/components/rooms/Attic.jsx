import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const WALL_COLOR = '#5a4f42';
const WALL_HEIGHT = 2.4;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

function Clickable({ position, label, onInteract, itemName, children }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onInteract(itemName, 'take');
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
        {children}
      </group>
      <ObjectLabel text={label} visible={hovered} position={[0, 0.5, 0]} />
    </group>
  );
}

function Rope({ onInteract }) {
  return (
    <Clickable position={[-3, GROUND_Y + 0.15, -2]} label="rope" onInteract={onInteract} itemName="rope">
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.12, 8, 16]} />
        <meshStandardMaterial color="#a8905a" />
      </mesh>
    </Clickable>
  );
}

// The attic table is a plain fixture (like the Kitchen's table) - it
// always exists, independent of whether the knife sitting on it has
// been taken.
function AtticTable() {
  return (
    <group position={[2.5, GROUND_Y, -3]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.8]} />
        <meshStandardMaterial color="#6b5a42" />
      </mesh>
      {[[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.25, z]}>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#4a3d2c" />
        </mesh>
      ))}
    </group>
  );
}

function Knife({ onInteract }) {
  return (
    <Clickable position={[2.5, GROUND_Y + 0.58, -3]} label="knife" onInteract={onInteract} itemName="knife">
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.4, 0.06, 0.02]} />
        <meshStandardMaterial color="#c8c8ce" />
      </mesh>
    </Clickable>
  );
}

// Dark (no ONBIT in source) - a cramped attic space, no wall directly
// ahead: the only exit is the stairway down, which the fixed camera
// treats the same as every other room's open "entry" side.
export default function Attic({ items, onInteract }) {
  return (
    <group>
      <Ground color="#4a4236" size={7} />

      <mesh position={[-3.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 7]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[3.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 7]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[0, WALL_CENTER_Y, -3.5]}>
        <boxGeometry args={[7, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {items.rope.location === 'attic' && <Rope onInteract={onInteract} />}
      <AtticTable />
      {items.knife.location === 'attic' && <Knife onInteract={onInteract} />}
    </group>
  );
}
