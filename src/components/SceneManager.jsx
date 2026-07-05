import { RoomRegistry } from './rooms/RoomRegistry';

/**
 * Dispatches on currentRoom via RoomRegistry and returns that room's
 * primitives. Adding a room is one entry in the registry plus a new room
 * component - React's own mount/unmount on the switched-out JSX does the
 * "wipe old scene, build new one" work the vanilla engine had to do by
 * hand with scene.remove()/geometry.dispose().
 */
export default function SceneManager({ currentRoom, flags, items, onInteract }) {
  const renderRoom = RoomRegistry[currentRoom];
  if (!renderRoom) return null;
  return renderRoom({ flags, items, onInteract });
}
