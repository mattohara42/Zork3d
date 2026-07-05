import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Color } from 'three';
import SceneManager from './SceneManager';
import LanternLight from './primitives/LanternLight';

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

/**
 * Three lighting moods, not two:
 * - pitch black (isDark): a dark room with no lamp - no lights at all,
 *   matching the "eaten by a grue" mechanic.
 * - lantern-lit underground (isUnderground): a dark room WITH the lamp
 *   lit - a dim ambient wash plus a spotlight simulating the brass
 *   lantern the player is carrying, for that spooky-dungeon read instead
 *   of flat, evenly-lit geometry.
 * - outdoors/normal (neither): the existing bright daylight rig.
 */
function SceneLighting({ isDark, isUnderground }) {
  if (isDark) return null;
  if (isUnderground) {
    return (
      <>
        <ambientLight intensity={0.1} />
        <LanternLight />
      </>
    );
  }
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 12, 6]} intensity={0.8} />
    </>
  );
}

export default function ViewportCanvas({
  currentRoom,
  flags,
  items,
  isDark,
  isUnderground,
  onInteract,
}) {
  const backgroundColor = isDark || isUnderground ? DARK_COLOR : SKY_COLOR;

  return (
    <div style={{ flex: '0 0 65%', width: '100%', background: backgroundColor }}>
      <Canvas camera={{ position: [0, 0, 0], fov: CAMERA_FOV, near: 0.1, far: 1000 }}>
        <FixedCameraRig />
        <SceneBackground color={backgroundColor} />
        <SceneLighting isDark={isDark} isUnderground={isUnderground} />
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
