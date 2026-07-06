import Ground, { GROUND_Y } from '../primitives/Ground';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#3d3833';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// Dark, narrow corridor between Round Room and the Mirror Room maze.
export default function NarrowPassage() {
  return (
    <group>
      <Ground color="#413a30" size={5} />
      <DungeonWall position={[-1.6, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} depth={5} color={WALL_COLOR} />
      <DungeonWall position={[1.6, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} depth={5} color={WALL_COLOR} />
    </group>
  );
}
