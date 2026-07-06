import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';

// How quickly the camera catches up to its target each frame - not a
// literal duration, since the lerp only asymptotically approaches the
// target. Framed as delta*LERP_SPEED rather than a bare constant factor
// so the slide takes roughly the same amount of perceived time
// regardless of frame rate.
const LERP_SPEED = 4;

// The per-frame lerp factor is capped well below 1 - a raw
// `delta*LERP_SPEED` would clamp to a full 1 (i.e. snap, not slide) on
// any single slow frame, and a room change is exactly when that's
// likely: mounting a whole new room's geometry can stall the render
// loop long enough that the *next* frame's delta alone covers the
// entire intended transition. Capping the step size guarantees the
// slide always plays out over multiple frames no matter how choppy the
// frame that triggered it was.
const MAX_STEP = 0.2;

/**
 * Eases the camera's position toward `targetOffset` every frame instead
 * of snapping there, using three separate THREE.MathUtils.lerp calls (one
 * per axis) rather than THREE.Vector3.lerp - same result, but keeps the
 * per-axis math visible rather than hidden inside a vector method.
 *
 * Deliberately position-only: the camera's rotation is set once, at
 * mount, by ViewportCanvas's FixedCameraRig and never touched again -
 * "always facing -Z" stays true regardless of where along that axis the
 * camera actually sits, so a sliding position doesn't need a
 * corresponding sliding lookAt to still read correctly.
 *
 * `targetOffset` defaults to [0,0,0] for every room that doesn't define
 * its own `cameraOffset` (see gameData/rooms.js) - the vast majority of
 * rooms, which keeps their geometry exactly as it always was, built
 * around a camera that's actually at the origin. Only rooms that opt in
 * with a real offset get a camera that settles somewhere else, and the
 * slide is what makes arriving at that offset feel like a deliberate
 * move into the room rather than a snap.
 */
export default function CameraController({ targetOffset }) {
  const { camera } = useThree();
  const [x, y, z] = targetOffset;
  const targetRef = useRef(new Vector3(x, y, z));

  useEffect(() => {
    targetRef.current.set(x, y, z);
  }, [x, y, z]);

  useFrame((_, delta) => {
    const target = targetRef.current;
    const t = Math.min(MAX_STEP, delta * LERP_SPEED);
    camera.position.set(
      MathUtils.lerp(camera.position.x, target.x, t),
      MathUtils.lerp(camera.position.y, target.y, t),
      MathUtils.lerp(camera.position.z, target.z, t)
    );
  });

  return null;
}
