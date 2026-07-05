import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import SceneManager from './SceneManager';

const SKY_COLOR = '#87ceeb';
const DARK_COLOR = '#000000';
const CAMERA_FOV = 60;

/**
 * Every room is its own stage: the camera never travels through a shared
 * world, it just sits fixed at the origin looking straight ahead, and each
 * room's scene component builds its geometry relative to that fixed
 * first-person viewpoint (see GROUND_Y in primitives/Ground.jsx). This
 * runs once on mount to lock that in - Canvas's `camera` prop sets
 * position/fov but never calls lookAt() for you.
 */
function FixedCameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, -1);
  }, [camera]);

  return null;
}

export default function ViewportCanvas({ currentRoom, flags, items, isDark, onInteract }) {
  return (
    <div style={{ flex: '0 0 65%', width: '100%', background: isDark ? DARK_COLOR : SKY_COLOR }}>
      <Canvas camera={{ position: [0, 0, 0], fov: CAMERA_FOV, near: 0.1, far: 1000 }}>
        <FixedCameraRig />
        <color attach="background" args={[isDark ? DARK_COLOR : SKY_COLOR]} />
        {!isDark && (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[8, 12, 6]} intensity={0.8} />
          </>
        )}
        <SceneManager
          currentRoom={currentRoom}
          flags={flags}
          items={items}
          onInteract={onInteract}
        />
      </Canvas>
    </div>
  );
}
