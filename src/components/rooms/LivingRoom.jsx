import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const WALL_COLOR = '#7a5c3e';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

const RUG_CENTER_X = 0;
const RUG_MOVED_X = -2.6;
const RUG_Z = -2;

// Kept close to center-x and deep enough (near the back wall) to stay
// inside the camera's field of view - a shallow depth with a wide x
// offset (as this originally was, at x=3.5/z=-2) puts the object outside
// the frustum entirely, invisible despite "working" logically.
const CASE_X = 2;
const CASE_Z = -3.8;

function TrophyCase() {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[CASE_X, GROUND_Y + 1, CASE_Z]}>
      <mesh
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
        <boxGeometry args={[0.6, 2, 1]} />
        <meshStandardMaterial color={hovered ? '#8a6b45' : '#6b4a2f'} />
      </mesh>
      <mesh position={[0.31, 0, 0]}>
        <boxGeometry args={[0.02, 1.7, 0.7]} />
        <meshStandardMaterial color="#bfe3f0" transparent opacity={0.35} />
      </mesh>
      <ObjectLabel text="trophy case" visible={hovered} position={[0, 1.3, 0]} />
    </group>
  );
}

// The case itself is a mostly-opaque box (only one thin side pane is
// glass), so deposited treasures render just in front of it - like
// items set out on a low shelf - rather than genuinely inside a
// transparent case, the same simplification the lamp/sword already
// make by sitting on top of it instead of behind real glass.
function DepositedTreasure({ item, index, onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[(index - 0.5) * 0.35, 0, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract(item.id, 'take');
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
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color={hovered ? '#ffe08a' : '#d4af37'} />
      </mesh>
      <ObjectLabel text={item.name} visible={hovered} position={[0, 0.3, 0]} />
    </group>
  );
}

function DepositedTreasures({ items, onInteract }) {
  const deposited = Object.values(items).filter((item) => item.location === 'trophyCase');

  return (
    <group position={[CASE_X, GROUND_Y + 0.8, CASE_Z + 0.65]}>
      {deposited.map((item, i) => (
        <DepositedTreasure key={item.id} item={item} index={i} onInteract={onInteract} />
      ))}
    </group>
  );
}

function Rug({ moved, onInteract }) {
  const [hovered, setHovered] = useState(false);
  const x = moved ? RUG_MOVED_X : RUG_CENTER_X;

  return (
    <mesh
      position={[x, GROUND_Y + 0.02, RUG_Z]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onInteract('rug', 'move');
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
      <planeGeometry args={[2.6, 1.8]} />
      <meshStandardMaterial color={hovered ? '#9a3a3a' : '#7a2a2a'} />
      <ObjectLabel text="rug" visible={hovered} position={[0, 0, 0.3]} />
    </mesh>
  );
}

function Lamp({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[CASE_X, GROUND_Y + 2.15, CASE_Z]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('lamp', 'take');
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
        <cylinderGeometry args={[0.12, 0.15, 0.25, 8]} />
        <meshStandardMaterial color={hovered ? '#e8c66a' : '#c9a227'} />
      </mesh>
      <ObjectLabel text="brass lantern" visible={hovered} position={[0, 0.35, 0]} />
    </group>
  );
}

function Sword({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[CASE_X, GROUND_Y + 2.7, CASE_Z - 0.3]} rotation={[0.3, 0, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('sword', 'take');
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
        <boxGeometry args={[0.08, 0.9, 0.02]} />
        <meshStandardMaterial color={hovered ? '#e8e8e8' : '#c0c0c8'} />
      </mesh>
      <ObjectLabel text="sword" visible={hovered} position={[0, 0.6, 0]} />
    </group>
  );
}

function TrapDoor({ rugMoved, open, onInteract }) {
  const [hovered, setHovered] = useState(false);

  if (!rugMoved) return null;

  return (
    <group>
      <mesh
        position={open ? [0, GROUND_Y + 0.6, RUG_Z - 0.5] : [0, GROUND_Y + 0.05, RUG_Z]}
        rotation={open ? [Math.PI / 2.3, 0, 0] : [0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onInteract('trap door', open ? 'close' : 'open');
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
        <boxGeometry args={[1.2, 0.1, 1.2]} />
        <meshStandardMaterial color={hovered ? '#8b6a4a' : '#6b4a2f'} />
      </mesh>
      <ObjectLabel text="trap door" visible={hovered} position={[0, GROUND_Y + 0.9, RUG_Z]} />
    </group>
  );
}

export default function LivingRoom({ flags, items, onInteract }) {
  return (
    <group>
      <Ground color="#8b6b47" size={9} />

      {/* Back wall to the west - the nailed-shut gothic door */}
      <mesh position={[0, WALL_CENTER_Y, -4.5]}>
        <boxGeometry args={[9, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[0, GROUND_Y + 1.4, -4.4]}>
        <boxGeometry args={[1.4, 2.6, 0.1]} />
        <meshStandardMaterial color="#4a3521" />
      </mesh>

      <mesh position={[-4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      <TrophyCase />
      <DepositedTreasures items={items} onInteract={onInteract} />
      {items.lamp.location === 'livingRoom' && <Lamp onInteract={onInteract} />}
      {items.sword.location === 'livingRoom' && <Sword onInteract={onInteract} />}
      <Rug moved={flags.rugMoved} onInteract={onInteract} />
      <TrapDoor rugMoved={flags.rugMoved} open={flags.trapdoorOpen} onInteract={onInteract} />
    </group>
  );
}
