import WestOfHouse from './WestOfHouse';
import NorthOfHouse from './NorthOfHouse';
import SouthOfHouse from './SouthOfHouse';
import BehindHouse from './BehindHouse';
import Kitchen from './Kitchen';
import LivingRoom from './LivingRoom';
import Cellar from './Cellar';
import TrollRoom from './TrollRoom';
import Attic from './Attic';
import EastOfChasm from './EastOfChasm';
import Gallery from './Gallery';
import Studio from './Studio';

export const RoomRegistry = {
  westOfHouse: (props) => <WestOfHouse {...props} />,
  northOfHouse: (props) => <NorthOfHouse {...props} />,
  southOfHouse: (props) => <SouthOfHouse {...props} />,
  behindHouse: (props) => <BehindHouse {...props} />,
  kitchen: (props) => <Kitchen {...props} />,
  livingRoom: (props) => <LivingRoom {...props} />,
  cellar: (props) => <Cellar {...props} />,
  trollRoom: (props) => <TrollRoom {...props} />,
  attic: (props) => <Attic {...props} />,
  eastOfChasm: (props) => <EastOfChasm {...props} />,
  gallery: (props) => <Gallery {...props} />,
  studio: (props) => <Studio {...props} />,
};
