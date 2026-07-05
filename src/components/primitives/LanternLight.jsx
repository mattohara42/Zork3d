/**
 * Simulates carrying a lit brass lantern underground: a warm point
 * light anchored at the player's (camera's) position. Unlike a spot
 * light it has no direction/target to maintain - it just radiates from
 * wherever the player is standing, like a torch held in hand.
 */
export default function LanternLight() {
  return (
    <pointLight
      position={[0, 0.2, 0.2]}
      color="#ffd9a0"
      intensity={6}
      distance={14}
      decay={2}
    />
  );
}
