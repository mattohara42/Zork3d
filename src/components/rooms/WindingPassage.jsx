import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#403a30';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

export default function WindingPassage() {
  return (
    <group>
      <Ground color="#443d33" size={5} />
      <mesh position={[-1.6, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 5]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[1.6, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 5]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
