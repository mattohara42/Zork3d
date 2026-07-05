import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#4a4a52';
const SIDE_WALL_HEIGHT = 3;
const SIDE_WALL_CENTER_Y = GROUND_Y + SIDE_WALL_HEIGHT / 2;
const BACK_WALL_HEIGHT = 4;

// "A large room with a ceiling which cannot be detected from the ground" -
// tall and cavernous, but dark (RLANDBIT only, no ONBIT in the source -
// needs the lamp like the rest of this hub). Nearby side walls give the
// lantern something to catch; the far/tall back wall is just flavor,
// too distant for the lantern to light on its own. The LOW-TIDE-driven
// quiet/loud cycle and the ECHO/platinum-bar puzzle aren't modeled; the
// room reads as always loud.
export default function LoudRoom() {
  return (
    <group>
      <Ground color="#524d47" size={11} />
      <mesh position={[-4.5, SIDE_WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, SIDE_WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[4.5, SIDE_WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, SIDE_WALL_HEIGHT, 9]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[0, GROUND_Y + BACK_WALL_HEIGHT / 2, -7]}>
        <boxGeometry args={[11, BACK_WALL_HEIGHT, 0.5]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
