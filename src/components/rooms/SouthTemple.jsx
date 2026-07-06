import Ground, { GROUND_Y } from '../primitives/Ground';
import { ArchedDoorway } from '../3d/VisualKit';

const STONE_COLOR = '#8a8478';

// ONBIT + SACREDBIT - lit. The hole in the corner (down to Tiny Cave,
// gated on not carrying the coffin - see rooms.js) is a dark patch in
// the floor, same trick used for the Chasm/Dome Room pits.
//
// The archway behind the altar is pure background dressing, not a
// specific exit - this room's actual exits are handled abstractly by
// the direction buttons/typed commands like everywhere else in this
// game, so it doesn't need to represent "north" precisely. Its opening
// uses a dim stone tone rather than the kit's near-black default: this
// room is naturally lit (ONBIT), so a stark black hole would read as a
// void/rendering error instead of a passage continuing into shadow.
export default function SouthTemple() {
  return (
    <group>
      <Ground color="#807a6c" size={7} />
      <ArchedDoorway
        position={[0, GROUND_Y, -6]}
        width={2.6}
        height={3}
        color={STONE_COLOR}
        openingColor="#3a362e"
      />
      <mesh position={[0, GROUND_Y + 0.5, -3.5]}>
        <boxGeometry args={[1.6, 1, 0.8]} />
        <meshStandardMaterial color={STONE_COLOR} />
      </mesh>
      <mesh position={[-2.4, GROUND_Y - 0.04, -3.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}
