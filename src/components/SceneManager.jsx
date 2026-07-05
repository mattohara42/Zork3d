import WestOfHouseScene from './scenes/WestOfHouseScene';
import NorthOfHouseScene from './scenes/NorthOfHouseScene';
import SouthOfHouseScene from './scenes/SouthOfHouseScene';
import BehindHouseScene from './scenes/BehindHouseScene';
import KitchenScene from './scenes/KitchenScene';
import LivingRoomScene from './scenes/LivingRoomScene';
import CellarScene from './scenes/CellarScene';
import TrollRoomScene from './scenes/TrollRoomScene';

/**
 * Dispatches on currentRoom and returns that room's primitives. Adding a
 * room is one case here plus a new scene component - React's own
 * mount/unmount on the switched-out JSX does the "wipe old scene, build
 * new one" work the vanilla engine had to do by hand with
 * scene.remove()/geometry.dispose().
 */
export default function SceneManager({ currentRoom, flags, items, onInteract }) {
  switch (currentRoom) {
    case 'westOfHouse':
      return <WestOfHouseScene flags={flags} items={items} onInteract={onInteract} />;
    case 'northOfHouse':
      return <NorthOfHouseScene />;
    case 'southOfHouse':
      return <SouthOfHouseScene />;
    case 'behindHouse':
      return <BehindHouseScene flags={flags} onInteract={onInteract} />;
    case 'kitchen':
      return <KitchenScene />;
    case 'livingRoom':
      return <LivingRoomScene flags={flags} items={items} onInteract={onInteract} />;
    case 'cellar':
      return <CellarScene />;
    case 'trollRoom':
      return <TrollRoomScene />;
    default:
      return null;
  }
}
