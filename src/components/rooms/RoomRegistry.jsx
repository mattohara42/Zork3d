import WestOfHouse from './WestOfHouse';
import NorthOfHouse from './NorthOfHouse';
import SouthOfHouse from './SouthOfHouse';
import BehindHouse from './BehindHouse';
import Kitchen from './Kitchen';
import LivingRoom from './LivingRoom';
import Cellar from './Cellar';
import TrollRoom from './TrollRoom';

export const RoomRegistry = {
  westOfHouse: (props) => <WestOfHouse {...props} />,
  northOfHouse: (props) => <NorthOfHouse {...props} />,
  southOfHouse: (props) => <SouthOfHouse {...props} />,
  behindHouse: (props) => <BehindHouse {...props} />,
  kitchen: (props) => <Kitchen {...props} />,
  livingRoom: (props) => <LivingRoom {...props} />,
  cellar: (props) => <Cellar {...props} />,
  trollRoom: (props) => <TrollRoom {...props} />,
};
