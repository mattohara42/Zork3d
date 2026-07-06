import Ground, { GROUND_Y } from '../primitives/Ground';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#3a352f';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// A chasm runs southwest to northeast along the path - reusing
// EastOfChasm's dark-pit-in-the-floor trick rather than modeling real
// depth. Down is a genuine dead end here ("Are you out of your mind?").
// Side walls (same as EastOfChasm) give the lantern something to catch.
export default function ChasmRoom() {
  return (
    <group>
      <Ground color="#463f35" size={9} />
      <mesh position={[0, GROUND_Y - 0.05, -3.5]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[7, 0.1, 2.5]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <DungeonWall position={[-4.5, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />
      <DungeonWall position={[4.5, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />
    </group>
  );
}
