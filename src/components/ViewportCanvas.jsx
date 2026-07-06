import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Color } from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import SceneManager from './SceneManager';
import EnvironmentLighting from './primitives/EnvironmentLighting';
import CameraController from './CameraController';

const ZERO_OFFSET = [0, 0, 0];

const SKY_COLOR = '#87ceeb';
const DARK_COLOR = '#000000';
const FOG_COLOR = '#050505';
const CAMERA_FOV = 60;

/**
 * Sets the camera's starting position/rotation once, at mount - every
 * room still builds its geometry around the origin (see GROUND_Y in
 * primitives/Ground.jsx), so this is what the vast majority of rooms
 * (no `cameraOffset`) actually rest at. Only *rotation* stays fixed for
 * the whole session, though: CameraController (rendered alongside this)
 * takes over *position* on every subsequent frame, easing it toward
 * whatever offset the current room requests - "always facing -Z" is
 * true regardless of where the camera sits along that heading, so a
 * moving position never needs a re-aimed lookAt to keep reading right.
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
  cameraOffset = ZERO_OFFSET,
  onInteract,
}) {
  // isDark/isUnderground alone miss one real case: a naturally-lit
  // underground room (Gallery, the Dam rooms, both Temples - ONBIT in
  // the source) has room.dark===false, so both booleans are false even
  // though there's still no sky down there. Falling through to SKY_COLOR
  // showed a bright outdoor gradient bleeding through any open exit in
  // those rooms - caught by actually looking at South Temple after
  // adding its archway, not something the archway itself caused.
  const backgroundColor = isDark || isUnderground || environment === 'underground' ? DARK_COLOR : SKY_COLOR;

  return (
    <div style={{ flex: '0 0 65%', width: '100%', background: backgroundColor }}>
      <Canvas shadows camera={{ position: [0, 0, 0], fov: CAMERA_FOV, near: 0.1, far: 1000 }}>
        <FixedCameraRig />
        <CameraController targetOffset={cameraOffset} />
        <SceneBackground color={backgroundColor} />
        <EnvironmentLighting
          environment={environment}
          naturallyLit={naturallyLit}
          lanternLit={lanternLit}
        />
        {/* Near fog for dungeons only - snaps on/off with the room like
            every other lighting change, no fade. Outdoors stays fog-free;
            the daylight rig already reads as open-air. Pushed out further
            than a first pass at this (5-15) once the brighter lantern
            above made the old range fog out most of a lit room's walls
            before any of the new light/bloom work could actually be
            seen - this keeps the "can't see far in a cave" mood without
            erasing the room. */}
        {(isDark || isUnderground) && <fog attach="fog" args={[FOG_COLOR, 9, 24]} />}
        <SceneManager
          currentRoom={currentRoom}
          flags={flags}
          items={items}
          onInteract={onInteract}
        />
        {/* A light global atmosphere pass rather than per-room bespoke
            effects: bloom picks out the lantern/torch/sky highlights so
            light sources actually read as glowing, and the vignette adds
            a bit of cinematic framing - both cheap enough to run in every
            room without a per-scene performance budget to track. */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.2} darkness={0.4} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
