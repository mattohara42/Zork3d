import Ground, { GROUND_Y } from '../primitives/Ground';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#403a30';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

export default function TwistingPassage() {
  return (
    <group>
      <Ground color="#443d33" size={5} />
      <DungeonWall position={[-1.6, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} depth={5} color={WALL_COLOR} />
      <DungeonWall position={[1.6, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} depth={5} color={WALL_COLOR} />
    </group>
  );
}
