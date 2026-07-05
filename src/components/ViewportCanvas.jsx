import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import SceneManager from './SceneManager';

const SKY_COLOR = '#87ceeb';
const DARK_COLOR = '#000000';
const CAMERA_POSITION = [18, 15, 18];
const CAMERA_ZOOM = 28;
const CAMERA_LOOK_AT = [0, 1, -5];

/**
 * R3F's <Canvas orthographic camera={{...}}> sets initial position but
 * never calls lookAt() for you, so the view stays pointed down -Z by
 * default. This runs once on mount to lock in the isometric angle. The
 * camera never moves after that - every room is a fresh stage built
 * around this one fixed viewpoint, not a world the camera travels through.
 */
function IsoCameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...CAMERA_POSITION);
    camera.zoom = CAMERA_ZOOM;
    camera.lookAt(...CAMERA_LOOK_AT);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

export default function ViewportCanvas({ currentRoom, flags, items, isDark, onInteract }) {
  return (
    <div style={{ flex: '0 0 65%', width: '100%', background: isDark ? DARK_COLOR : SKY_COLOR }}>
      <Canvas
        orthographic
        camera={{ position: CAMERA_POSITION, zoom: CAMERA_ZOOM, near: 0.1, far: 500 }}
      >
        <IsoCameraRig />
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
