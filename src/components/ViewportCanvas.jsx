import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Color } from 'three';
import SceneManager from './SceneManager';
import EnvironmentLighting from './primitives/EnvironmentLighting';

const SKY_COLOR = '#87ceeb';
const DARK_COLOR = '#000000';
const FOG_COLOR = '#050505';
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

/**
 * Sets scene.background imperatively. The declarative `<color attach=
 * "background" args={[color]} />` form didn't reliably pick up color
 * changes here, so this mirrors FixedCameraRig's approach instead.
 */
function SceneBackground({ color }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new Color(color);
  }, [scene, color]);

  return null;
}

export default function ViewportCanvas({
  currentRoom,
  flags,
  items,
  isDark,
  isUnderground,
  environment,
  naturallyLit,
  lanternLit,
  onInteract,
}) {
  const backgroundColor = isDark || isUnderground ? DARK_COLOR : SKY_COLOR;

  return (
    <div style={{ flex: '0 0 65%', width: '100%', background: backgroundColor }}>
      <Canvas shadows camera={{ position: [0, 0, 0], fov: CAMERA_FOV, near: 0.1, far: 1000 }}>
        <FixedCameraRig />
        <SceneBackground color={backgroundColor} />
        <EnvironmentLighting
          environment={environment}
          naturallyLit={naturallyLit}
          lanternLit={lanternLit}
        />
        {/* Heavy near fog for dungeons only - snaps on/off with the room
            like every other lighting change, no fade. Outdoors stays
            fog-free; the daylight rig already reads as open-air. */}
        {(isDark || isUnderground) && <fog attach="fog" args={[FOG_COLOR, 5, 15]} />}
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
