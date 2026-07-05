import { useGameState } from './state/useGameState';
import { useKeyboardMovement } from './state/useKeyboardMovement';
import ViewportCanvas from './components/ViewportCanvas';
import TextTerminal from './components/TextTerminal';

export default function App() {
  const {
    currentRoom,
    room,
    exits,
    isDark,
    isUnderground,
    flags,
    items,
    terminalLogs,
    moveRoom,
    interactWithObject,
    runCommand,
  } = useGameState();

  useKeyboardMovement(moveRoom);

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
        onInteract={interactWithObject}
      />
      <TextTerminal
        room={room}
        exits={exits}
        isDark={isDark}
        terminalLogs={terminalLogs}
        onMove={moveRoom}
        onCommand={runCommand}
      />
    </div>
  );
}
