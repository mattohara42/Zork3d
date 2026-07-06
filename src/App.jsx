import { useState } from 'react';
import { useGameState } from './state/useGameState';
import { useKeyboardMovement } from './state/useKeyboardMovement';
import ViewportCanvas from './components/ViewportCanvas';
import TextTerminal from './components/TextTerminal';
import MapPanel from './components/MapPanel';

export default function App() {
  const {
    currentRoom,
    visitedRooms,
    room,
    roomText,
    exits,
    isDark,
    isUnderground,
    flags,
    items,
    hasLampLit,
    terminalLogs,
    moveRoom,
    interactWithObject,
    runCommand,
  } = useGameState();

  useKeyboardMovement(moveRoom);

  const [showMap, setShowMap] = useState(false);

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
        items={items}
        isDark={isDark}
        isUnderground={isUnderground}
        environment={room.environment}
        naturallyLit={!room.dark}
        lanternLit={hasLampLit}
        onInteract={interactWithObject}
      />
      <TextTerminal
        room={room}
        roomText={roomText}
        exits={exits}
        isDark={isDark}
        terminalLogs={terminalLogs}
        onMove={moveRoom}
        onCommand={runCommand}
        onToggleMap={() => setShowMap((v) => !v)}
      />
      {showMap && (
        <MapPanel
          visitedRooms={visitedRooms}
          currentRoom={currentRoom}
          flags={flags}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
