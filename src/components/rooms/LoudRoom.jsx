import Ground, { GROUND_Y } from '../primitives/Ground';
import { DungeonWall } from '../3d/VisualKit';

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
      <DungeonWall position={[-4.5, SIDE_WALL_CENTER_Y, 0]} height={SIDE_WALL_HEIGHT} color={WALL_COLOR} />
      <DungeonWall position={[4.5, SIDE_WALL_CENTER_Y, 0]} height={SIDE_WALL_HEIGHT} color={WALL_COLOR} />
      {/* Rotated 90° so DungeonWall's default thin-local-X/long-local-Z
          shape lands thin-in-world-Z/long-in-world-X instead - what a
          back wall (spanning the room's width) needs, versus the side
          walls above which use the component's natural orientation. */}
      <DungeonWall
        position={[0, GROUND_Y + BACK_WALL_HEIGHT / 2, -7]}
        rotation={[0, Math.PI / 2, 0]}
        width={0.5}
        height={BACK_WALL_HEIGHT}
        depth={11}
        color={WALL_COLOR}
      />
    </group>
  );
}
