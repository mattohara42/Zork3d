import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_HEIGHT = 3;

// Same twisty-passage floor as the rest of the maze, but with a grate
// visible overhead - the one landmark room down here, matching its
// distinct text ("Above you is a grating...").
export default function GratingRoom() {
  return (
    <group>
      <Ground color="#4a453e" size={7} />
      <mesh position={[0, GROUND_Y + WALL_HEIGHT, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.2, 1.2, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" wireframe />
      </mesh>
    </group>
  );
}
