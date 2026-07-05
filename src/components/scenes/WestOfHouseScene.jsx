import Ground from '../primitives/Ground';
import HouseShell from '../primitives/HouseShell';
import Mailbox from '../primitives/Mailbox';

export default function WestOfHouseScene({ flags, items, onInteract }) {
  return (
    <group>
      <Ground color="#3c8f3c" />
      <HouseShell />
      <Mailbox
        open={flags.mailboxOpen}
        hasLeaflet={items.leaflet.location === 'mailbox'}
        onInteract={onInteract}
      />
    </group>
  );
}
