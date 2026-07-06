import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Three's lights are physically based (candela-scale intensity, real
// inverse-square falloff) - this needs a much bigger number than the old
// "intensity=1 is already bright" model to read at a few meters, which is
// also why a hand lantern's pool of light staying small and warm right
// around the player, with walls a few meters off fading to black, is
// physically correct (a real lantern doesn't floodlight a room either),
// not a bug to chase away by cranking this further.
const BASE_INTENSITY = 40;

/**
 * Simulates carrying a lit brass lantern underground: a warm point
 * light anchored at the player's (camera's) position. Unlike a spot
 * light it has no direction/target to maintain - it just radiates from
 * wherever the player is standing, like a torch held in hand.
 *
 * Intensity is jittered every frame (mutated directly on the light
 * rather than through React state) to read as a real flame rather than
 * a flat electric bulb - two sine waves at different speeds plus a
 * touch of randomness avoids the perfectly periodic look a single sine
 * would have. The jitter is a fraction of BASE_INTENSITY rather than a
 * fixed amount so it stays visible if the base value ever changes.
 */
export default function LanternLight() {
  const lightRef = useRef(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    const flicker =
      Math.sin(t * 9) * 0.05 + Math.sin(t * 23 + 1) * 0.03 + (Math.random() - 0.5) * 0.05;
    lightRef.current.intensity = BASE_INTENSITY * (1 + flicker);
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0.6, 0.2]}
      color="#ffd9a0"
      intensity={BASE_INTENSITY}
      distance={30}
      decay={2}
    />
  );
}
