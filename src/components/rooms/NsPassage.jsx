import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#443f37';
const WALL_HEIGHT = 4.5;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// "A high north-south passage" - taller and narrower than most corridors,
// forking northeast (remapped to the room's cardinal east exit).
export default function NsPassage() {
  return (
    <group>
      <mesh position={[-2, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[2, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <Ground color="#453f36" size={4} />
    </group>
  );
}
