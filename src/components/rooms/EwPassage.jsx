import Ground, { GROUND_Y } from '../primitives/Ground';
import { DungeonWall } from '../3d/VisualKit';

const WALL_COLOR = '#3d3833';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;

// Dark, narrow east-west passage with a stairway down at the north end -
// both "down" and "north" lead to the Chasm in this simplified graph.
// Side walls stand in for the "narrow" framing (same trick as NS-Passage)
// so the lantern has something nearby to catch, rather than lighting an
// empty floor plane.
export default function EwPassage() {
  return (
    <group>
      <Ground color="#41392f" size={7} />
      <DungeonWall position={[-2, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} depth={7} color={WALL_COLOR} />
      <DungeonWall position={[2, WALL_CENTER_Y, 0]} height={WALL_HEIGHT} depth={7} color={WALL_COLOR} />
    </group>
  );
}
