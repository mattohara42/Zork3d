import { useState } from 'react';
import Ground, { GROUND_Y } from '../primitives/Ground';
import ObjectLabel from '../primitives/ObjectLabel';

const WALL_COLOR = '#7a5c3e';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

const RUG_CENTER_X = 0;
const RUG_MOVED_X = -2.6;
const RUG_Z = -2;

function TrophyCase() {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[3.5, GROUND_Y + 1, -2]}>
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

export default function LivingRoomScene({ flags, onInteract }) {
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
      <Rug moved={flags.rugMoved} onInteract={onInteract} />
      <TrapDoor rugMoved={flags.rugMoved} open={flags.trapdoorOpen} onInteract={onInteract} />
    </group>
  );
}
