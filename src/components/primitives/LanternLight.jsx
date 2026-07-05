import { useEffect, useRef } from 'react';

/**
 * Simulates carrying a lit brass lantern underground: a spotlight
 * anchored at the player's (camera's) position, aimed forward down -Z -
 * the same direction the fixed first-person camera always looks. A
 * SpotLight's direction is position -> target, and three.js won't update
 * that unless the target is actually in the scene graph, so we point a
 * ref at it and attach it manually rather than relying on the
 * `target-position` shorthand alone.
 */
export default function LanternLight() {
  const lightRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <>
      <spotLight
        ref={lightRef}
        position={[0, 0.3, 0.2]}
        angle={0.55}
        penumbra={0.6}
        intensity={8}
        distance={18}
        decay={2}
        color="#ffd9a0"
      />
      <object3D ref={targetRef} position={[0, -0.2, -10]} />
    </>
  );
}
