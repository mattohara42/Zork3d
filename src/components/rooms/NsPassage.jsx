import Ground, { GROUND_Y } from '../primitives/Ground';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#443f37';
const WALL_HEIGHT = 4.5;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// "A high north-south passage" - taller and narrower than most corridors,
// forking northeast (remapped to the room's cardinal east exit).
export default function NsPassage() {
  return (
    <group>
      <DungeonWall position={[-2, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />
      <DungeonWall position={[2, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} color={WALL_COLOR} />
      <Ground color="#453f36" size={4} />
    </group>
  );
}
