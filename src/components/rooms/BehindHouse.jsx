import Ground from '../primitives/Ground';
import HouseShell from '../primitives/HouseShell';
import WindowPane from '../primitives/WindowPane';

export default function BehindHouse({ flags, onInteract }) {
  return (
    <group>
      <Ground color="#3c8f3c" />
      <HouseShell />
      <WindowPane open={flags.windowOpen} onInteract={onInteract} />
    </group>
  );
}
