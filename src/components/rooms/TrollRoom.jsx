import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const WALL_COLOR = '#3f3a35';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// Low-poly troll: a blocky silhouette rather than anything articulated.
// Clickable now that combat exists - click fires the same 'attack'
// dispatch as typing "kill troll with sword".
function Troll({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, GROUND_Y, -3]}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onInteract('troll', 'attack');
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
          <boxGeometry args={[0.9, 1.4, 0.6]} />
          <meshStandardMaterial color={hovered ? '#5a6f48' : '#4a5a3a'} />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <boxGeometry args={[0.55, 0.5, 0.5]} />
          <meshStandardMaterial color={hovered ? '#647d52' : '#556b45'} />
        </mesh>
      </group>
      {/* Axe - drawn separately so it can vanish once the troll is disarmed. */}
      <mesh position={[0.65, 1.1, 0.1]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 1.3, 0.08]} />
        <meshStandardMaterial color="#5a4a3a" />
      </mesh>
      <mesh position={[0.75, 1.65, 0.1]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.35, 0.3, 0.05]} />
        <meshStandardMaterial color="#8a8f96" />
      </mesh>
      <ObjectLabel text="troll" visible={hovered} position={[0, 2.3, 0]} />
    </group>
  );
}

function DroppedSword({ onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[1.2, GROUND_Y + 0.03, -3.5]} rotation={[0, 0.4, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
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
        <planeGeometry args={[0.08, 0.9]} />
        <meshStandardMaterial color={hovered ? '#e8e8e8' : '#c0c0c8'} />
      </mesh>
      <ObjectLabel text="sword" visible={hovered} position={[0, 0.3, 0]} />
    </group>
  );
}

// Also dark (no ONBIT in source) - same lighting split as the Cellar. No
// wall directly ahead (-Z) since that's where the troll itself is; the
// side walls stand in for the blocked east/west passages and the
// forbidding hole west.
export default function TrollRoom({ flags, items, onInteract }) {
  return (
    <group>
      <Ground color="#332e28" size={9} />

      <mesh position={[-4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[4.5, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {!flags.trollDefeated && <Troll onInteract={onInteract} />}
      {items.sword.location === 'trollRoom' && <DroppedSword onInteract={onInteract} />}
    </group>
  );
}
