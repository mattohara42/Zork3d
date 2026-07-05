import React, { useCallback, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';

/* =========================================================================
   ROOM DATA
   Static reference data the state hook and SceneManager both read from.
   Keeping it outside the component tree means it never gets re-created
   on render.
   ========================================================================= */
const ROOMS = {
  westOfHouse: {
    name: 'West of House',
    description:
      'You are standing in an open field west of a white house, with a boarded front door. There is a small mailbox here.',
    exits: { north: 'northOfHouse', south: null, east: null, west: null },
  },
  northOfHouse: {
    name: 'North of House',
    description:
      'You are facing the north side of a white house. There is no door here, and all the windows are boarded up. To the north a narrow path winds through the trees.',
    exits: { north: null, south: 'westOfHouse', east: null, west: null },
  },
};

/* =========================================================================
   1. STATE HOOK
   ========================================================================= */
function useGameState() {
  const [currentRoom, setCurrentRoom] = useState('westOfHouse');
  const [inventory, setInventory] = useState([]);
  const [flags, setFlags] = useState({
    mailboxOpen: false,
    trapdoorLocked: true,
  });
  const [terminalLogs, setTerminalLogs] = useState([
    ROOMS.westOfHouse.description,
  ]);

  const log = useCallback((message) => {
    setTerminalLogs((prev) => [...prev, message]);
  }, []);

  const moveRoom = useCallback(
    (direction) => {
      const room = ROOMS[currentRoom];
      const targetId = room.exits[direction];
      if (!targetId) {
        log("You can't go that way.");
        return;
      }
      setCurrentRoom(targetId);
      log(ROOMS[targetId].description);
    },
    [currentRoom, log]
  );

  const interactWithObject = useCallback(
    (objectName, action) => {
      if (objectName === 'mailbox') {
        if (action === 'open') {
          if (flags.mailboxOpen) {
            log('It is already open.');
            return;
          }
          setFlags((prev) => ({ ...prev, mailboxOpen: true }));
          log('Opening the small mailbox reveals a leaflet.');
          return;
        }
        if (action === 'close') {
          if (!flags.mailboxOpen) {
            log('It is already closed.');
            return;
          }
          setFlags((prev) => ({ ...prev, mailboxOpen: false }));
          log('Closed.');
          return;
        }
      }
      log(`Nothing happens.`);
    },
    [flags, log]
  );

  return {
    currentRoom,
    roomData: ROOMS[currentRoom],
    inventory,
    setInventory,
    flags,
    terminalLogs,
    moveRoom,
    interactWithObject,
  };
}

/* =========================================================================
   CAMERA RIG
   R3F's <Canvas orthographic camera={{...}}> sets initial position but
   never calls lookAt() for you, so the view stays pointed down -Z by
   default. This runs once on mount to lock in the isometric-ish angle.
   ========================================================================= */
function IsoCameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(18, 15, 18);
    camera.zoom = 28;
    camera.lookAt(0, 1, -5);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

/* =========================================================================
   SCENE PRIMITIVES
   Small reusable pieces shared across rooms, low-poly/retro-minimalist
   palette to match the rest of the project.
   ========================================================================= */
function HouseShell() {
  return (
    <group>
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[6, 4, 5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 4, -8]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.5, 2, 4]} />
        <meshStandardMaterial color="#8b4a3c" />
      </mesh>
    </group>
  );
}

function Ground({ color }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
        <meshStandardMaterial color="#5a3a2a" />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.8, 1.8, 6]} />
        <meshStandardMaterial color="#2e6b2e" />
      </mesh>
    </group>
  );
}

/* Mailbox is the one clickable object in this prototype - it demonstrates
   the onClick -> interactWithObject wiring requested in the spec. */
function Mailbox({ open, onInteract }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[3, -0.6, -2]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract('mailbox', open ? 'close' : 'open');
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
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color={hovered ? '#d24444' : '#aa2222'} />
      </mesh>
      {/* Lid - flat when closed, flipped up when open */}
      <mesh
        position={open ? [0, 0.4, -0.13] : [0, 0.38, 0]}
        rotation={open ? [Math.PI / 2.2, 0, 0] : [0, 0, 0]}
      >
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#8b1f1f" />
      </mesh>
      {open && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.25, 0.02, 0.18]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
}

/* =========================================================================
   2. SCENE MANAGER
   Dispatches on currentRoom and returns the primitives for that room.
   Each room scene reads flags itself rather than SceneManager picking
   apart per-room flag logic, so adding a room doesn't touch this switch
   beyond one line.
   ========================================================================= */
function SceneManager({ currentRoom, flags, onInteract }) {
  switch (currentRoom) {
    case 'westOfHouse':
      return (
        <group>
          <Ground color="#3c8f3c" />
          <HouseShell />
          <Mailbox open={flags.mailboxOpen} onInteract={onInteract} />
        </group>
      );
    case 'northOfHouse':
      return (
        <group>
          <Ground color="#357a35" />
          <HouseShell />
          <Tree position={[-5, -1, -4]} />
          <Tree position={[5, -1, -3]} />
        </group>
      );
    default:
      return null;
  }
}

/* =========================================================================
   3. VIEWPORT CANVAS
   Top-aligned panel housing the R3F Canvas. Orthographic camera gives the
   flat, retro-isometric read; lighting is shared across all rooms.
   ========================================================================= */
function ViewportCanvas({ currentRoom, flags, onInteract }) {
  return (
    <div
      style={{
        flex: '0 0 65%',
        width: '100%',
        background: '#87ceeb',
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [18, 15, 18], zoom: 28, near: 0.1, far: 500 }}
      >
        <IsoCameraRig />
        <ambientLight intensity={0.6} />
        <directionalLight position={[8, 12, 6]} intensity={0.8} />
        <SceneManager
          currentRoom={currentRoom}
          flags={flags}
          onInteract={onInteract}
        />
      </Canvas>
    </div>
  );
}

/* =========================================================================
   4. TEXT TERMINAL
   Bottom-aligned panel: room description, scrolling log, direction
   buttons. Buttons disable themselves when a room has no exit that way,
   same affordance pattern as the room-name display.
   ========================================================================= */
const DIRECTIONS = ['north', 'south', 'east', 'west'];

function TextTerminal({ roomData, exits, terminalLogs, onMove }) {
  return (
    <div
      style={{
        flex: '0 0 35%',
        width: '100%',
        boxSizing: 'border-box',
        background: '#04120a',
        color: '#d8f5d8',
        fontFamily: "'Courier New', Courier, monospace",
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ margin: '0 0 6px 0', color: '#9fffa0', fontSize: 20 }}>
        {roomData.name}
      </h2>
      <p style={{ margin: '0 0 12px 0', lineHeight: 1.4, fontSize: 15 }}>
        {roomData.description}
      </p>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          fontSize: 13,
          opacity: 0.75,
          borderTop: '1px solid rgba(76,175,80,0.3)',
          paddingTop: 8,
          marginBottom: 12,
        }}
      >
        {terminalLogs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {DIRECTIONS.map((dir) => (
          <button
            key={dir}
            onClick={() => onMove(dir)}
            disabled={!exits[dir]}
            style={{
              background: exits[dir]
                ? 'rgba(20,40,20,0.8)'
                : 'rgba(20,40,20,0.3)',
              border: '1px solid #4caf50',
              color: exits[dir] ? '#d8f5d8' : '#5a7a5a',
              fontFamily: 'inherit',
              fontSize: 13,
              padding: '6px 12px',
              cursor: exits[dir] ? 'pointer' : 'default',
              borderRadius: 3,
              textTransform: 'capitalize',
            }}
          >
            {dir}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   ROOT APP
   ========================================================================= */
export default function App() {
  const {
    currentRoom,
    roomData,
    flags,
    terminalLogs,
    moveRoom,
    interactWithObject,
  } = useGameState();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ViewportCanvas
        currentRoom={currentRoom}
        flags={flags}
        onInteract={interactWithObject}
      />
      <TextTerminal
        roomData={roomData}
        exits={ROOMS[currentRoom].exits}
        terminalLogs={terminalLogs}
        onMove={moveRoom}
      />
    </div>
  );
}
