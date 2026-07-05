import WestOfHouse from './rooms/WestOfHouse';
import NorthOfHouse from './rooms/NorthOfHouse';
import SouthOfHouse from './rooms/SouthOfHouse';
import BehindHouse from './rooms/BehindHouse';
import Kitchen from './rooms/Kitchen';
import LivingRoom from './rooms/LivingRoom';
import Cellar from './rooms/Cellar';
import TrollRoom from './rooms/TrollRoom';

/**
 * Dispatches on currentRoom and returns that room's primitives. Adding a
 * room is one case here plus a new room component - React's own
 * mount/unmount on the switched-out JSX does the "wipe old scene, build
 * new one" work the vanilla engine had to do by hand with
 * scene.remove()/geometry.dispose().
 */
export default function SceneManager({ currentRoom, flags, items, onInteract }) {
  switch (currentRoom) {
    case 'westOfHouse':
      return <WestOfHouse flags={flags} items={items} onInteract={onInteract} />;
    case 'northOfHouse':
      return <NorthOfHouse />;
    case 'southOfHouse':
      return <SouthOfHouse />;
    case 'behindHouse':
      return <BehindHouse flags={flags} onInteract={onInteract} />;
    case 'kitchen':
      return <Kitchen />;
    case 'livingRoom':
      return <LivingRoom flags={flags} items={items} onInteract={onInteract} />;
    case 'cellar':
      return <Cellar />;
    case 'trollRoom':
      return <TrollRoom />;
    default:
      return null;
  }
}
