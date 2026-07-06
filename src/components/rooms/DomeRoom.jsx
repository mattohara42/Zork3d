import Ground, { GROUND_Y } from '../primitives/Ground';

const RAIL_COLOR = '#8a6a42';

// The periphery of a dome over Torch Room below - the "drop" is a dark
// patch in the floor, same trick as the Chasm/East of Chasm pits. The
// rope only shows once tied (flags.domeFlag) - see useGameState's tie.
export default function DomeRoom({ flags }) {
  return (
    <group>
      <Ground color="#4a4438" size={7} />
      <mesh position={[0, GROUND_Y - 0.04, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 2.2, 24]} />
        <meshStandardMaterial color="#000000" side={2} />
      </mesh>
      <mesh position={[0, GROUND_Y + 0.5, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.08, 8, 24]} />
        <meshStandardMaterial color={RAIL_COLOR} />
      </mesh>
      {flags.domeFlag && (
        <mesh position={[0.5, GROUND_Y + 0.3, -4]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
          <meshStandardMaterial color="#8a7a5a" />
        </mesh>
      )}
    </group>
  );
}
