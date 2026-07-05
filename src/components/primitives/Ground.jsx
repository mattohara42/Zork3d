// Height of the player's eyes above the ground, for the first-person
// camera fixed at the world origin. Every room builds its floor this far
// below the camera so scale/eye-level stays consistent room to room.
export const EYE_HEIGHT = 1.6;
export const GROUND_Y = -EYE_HEIGHT;

export default function Ground({ color, size = 40 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
