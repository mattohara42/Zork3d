import Ground, { GROUND_Y } from '../primitives/Ground';

const WALL_COLOR = '#7a6350';
const WALL_HEIGHT = 5;

// "Beneath the walls of the river canyon...the lesser part of the
// runoff of Aragain Falls flows by below" - canyon walls to the sides,
// a strip of water cutting across the floor.
export default function CanyonBottom() {
  return (
    <group>
      <Ground color="#6b5a42" size={7} />
      <mesh position={[0, GROUND_Y + 0.02, -4]}>
        <boxGeometry args={[7, 0.05, 1.5]} />
        <meshStandardMaterial color="#3a6a8a" />
      </mesh>
      <mesh position={[-3.5, GROUND_Y + WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.5, WALL_HEIGHT, 7]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[3.5, GROUND_Y + WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.5, WALL_HEIGHT, 7]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}
