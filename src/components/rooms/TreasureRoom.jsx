import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#6b5a42';
const WALL_HEIGHT = 3.2;

// "A number of discarded bags, which crumble at your touch" - decorative
// clutter, distinct from the thief's own (still-intact) bag.
function Bag({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.3, 8, 6]} />
      <meshStandardMaterial color="#4a3d2c" />
    </mesh>
  );
}

// Guards the hoard until defeated - clicking attacks him, same as the
// Troll Room's clickable troll. Only the stationary "guardian" version of
// the thief is modeled (see PROJECT_STATUS.md) - no roaming, no stealing.
function Thief({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[-1.2, GROUND_Y, -3.2]}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onInteract('thief', 'attack');
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
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.7, 1.4, 0.4]} />
          <meshStandardMaterial color={hovered ? '#4a4a5a' : '#3a3a48'} />
        </mesh>
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.28, 10, 10]} />
          <meshStandardMaterial color={hovered ? '#c9a876' : '#b89568'} />
        </mesh>
      </group>
      {/* Large bag, slung over the shoulder */}
      <mesh position={[-0.5, 1.1, 0.1]}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#5a4a38" />
      </mesh>
      {/* Stiletto */}
      <mesh position={[0.45, 1.0, 0.15]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.04, 0.55, 0.04]} />
        <meshStandardMaterial color="#c8c8ce" />
      </mesh>
      <ObjectLabel text="thief" visible={hovered} position={[0, 2.15, 0]} />
    </group>
  );
}

function Chalice({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[1.5, GROUND_Y + 0.05, -3]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('chalice', 'take');
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
        <cylinderGeometry args={[0.16, 0.1, 0.3, 12]} />
        <meshStandardMaterial color={hovered ? '#f0f0e0' : '#d8d8c0'} metalness={0.7} />
      </mesh>
      <ObjectLabel text="chalice" visible={hovered} position={[0, 0.55, 0]} />
    </group>
  );
}

// Only ever shows up here once the thief has died holding the egg (the
// only way to open it undamaged - see useGameState's attackThief).
function Canary({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0.6, GROUND_Y + 0.15, -3.4]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('canary', 'take');
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
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color={hovered ? '#ffe680' : '#d4af37'} />
      </mesh>
      <ObjectLabel text="canary" visible={hovered} position={[0, 0.35, 0]} />
    </group>
  );
}

export default function TreasureRoom({ flags, items, onInteract }) {
  return (
    <group>
      <Ground color="#5c4e38" size={8} />
      <DungeonWall
        position={[0, GROUND_Y + WALL_HEIGHT / 2, -4]}
        rotation={[0, Math.PI / 2, 0]}
        depth={8}
        height={WALL_HEIGHT}
        color={WALL_COLOR}
      />
      <Bag position={[-2.5, GROUND_Y + 0.2, -3]} />
      <Bag position={[2, GROUND_Y + 0.2, -3.3]} />
      {!flags.thiefDefeated && <Thief onInteract={onInteract} />}
      {items.chalice.location === 'treasureRoom' && <Chalice onInteract={onInteract} />}
      {items.canary.location === 'treasureRoom' && <Canary onInteract={onInteract} />}
    </group>
  );
}
