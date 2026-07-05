import { useRef, useState } from 'react';

const DIRECTIONS = ['north', 'south', 'east', 'west', 'up', 'down'];

export default function TextTerminal({ room, roomText, exits, isDark, terminalLogs, onMove, onCommand }) {
  const [input, setInput] = useState('');
  const logRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onCommand(input);
    setInput('');
  };

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
        minHeight: 0,
      }}
    >
      <h2 style={{ margin: '0 0 6px 0', color: '#9fffa0', fontSize: 20 }}>
        {isDark ? 'Pitch Black' : room.name}
      </h2>
      <p style={{ margin: '0 0 12px 0', lineHeight: 1.4, fontSize: 15 }}>
        {isDark ? 'It is pitch black. You are likely to be eaten by a grue.' : roomText}
      </p>

      <div
        ref={logRef}
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
          <div key={i} style={{ whiteSpace: 'pre-line' }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {DIRECTIONS.map((dir) => {
          // Blind in the dark: the clickable direction buttons go dark
          // too, since you can't see where the exits are. Typed commands
          // and WASD still work - moveRoom itself is never gated, only
          // this UI convenience is.
          const enabled = exits[dir] && !isDark;
          return (
            <button
              key={dir}
              onClick={() => onMove(dir)}
              disabled={!enabled}
              style={{
                background: enabled ? 'rgba(20,40,20,0.8)' : 'rgba(20,40,20,0.3)',
                border: '1px solid #4caf50',
                color: enabled ? '#d8f5d8' : '#5a7a5a',
                fontFamily: 'inherit',
                fontSize: 13,
                padding: '6px 12px',
                cursor: enabled ? 'pointer' : 'default',
                borderRadius: 3,
                textTransform: 'capitalize',
              }}
            >
              {dir}
            </button>
          );
        })}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type a command..."
            autoComplete="off"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid #4caf50',
              color: '#d8f5d8',
              fontFamily: 'inherit',
              fontSize: 13,
              padding: '6px 10px',
              borderRadius: 3,
              width: 220,
            }}
          />
          <button
            type="submit"
            style={{
              background: 'rgba(20,40,20,0.8)',
              border: '1px solid #4caf50',
              color: '#d8f5d8',
              fontFamily: 'inherit',
              fontSize: 13,
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: 3,
            }}
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
