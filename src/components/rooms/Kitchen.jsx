import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#e8dcc8';
const WALL_HEIGHT = 3;
const WALL_CENTER_Y = GROUND_Y + WALL_HEIGHT / 2;
const TABLE_HEIGHT = 0.1;
const TABLE_TOP_Y = GROUND_Y + 0.8;
const LEG_HEIGHT = 0.75;
const LEG_Y = GROUND_Y + LEG_HEIGHT / 2;
const LEG_POSITIONS = [
  [-3.05, -2.9],
  [-1.95, -2.9],
  [-3.05, -2.1],
  [-1.95, -2.1],
];

export default function Kitchen() {
  return (
    <group>
      <Ground color="#c9a876" size={8} />

      <mesh position={[0, WALL_CENTER_Y, -4]}>
        <boxGeometry args={[8, 3, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[-4, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 8]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[4, WALL_CENTER_Y, 0]}>
        <boxGeometry args={[0.2, WALL_HEIGHT, 8]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* Table - simple low-poly slab on four legs */}
      <mesh position={[-2.5, TABLE_TOP_Y, -2.5]}>
        <boxGeometry args={[1.4, TABLE_HEIGHT, 0.9]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      {LEG_POSITIONS.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, LEG_Y, z]}>
          <boxGeometry args={[0.1, LEG_HEIGHT, 0.1]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
      ))}
    </group>
  );
}
