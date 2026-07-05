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
import Forest1 from './Forest1';
import Forest2 from './Forest2';
import Forest3 from './Forest3';
import Mountains from './Mountains';
import Path from './Path';
import UpATree from './UpATree';
import GratingClearing from './GratingClearing';
import Clearing from './Clearing';
import CanyonView from './CanyonView';
import CliffMiddle from './CliffMiddle';
import CanyonBottom from './CanyonBottom';
import EndOfRainbow from './EndOfRainbow';
import MazeRoom from './MazeRoom';
import MazeDeadEnd from './MazeDeadEnd';
import GratingRoom from './GratingRoom';
import CyclopsRoom from './CyclopsRoom';
import StrangePassage from './StrangePassage';
import TreasureRoom from './TreasureRoom';

const MAZE_ROOM_IDS = [
  'maze1', 'maze2', 'maze3', 'maze4', 'maze5', 'maze6', 'maze7',
  'maze8', 'maze9', 'maze10', 'maze11', 'maze12', 'maze13', 'maze14', 'maze15',
];
const DEAD_END_IDS = ['deadEnd1', 'deadEnd2', 'deadEnd3', 'deadEnd4'];

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
  forest1: (props) => <Forest1 {...props} />,
  forest2: (props) => <Forest2 {...props} />,
  forest3: (props) => <Forest3 {...props} />,
  mountains: (props) => <Mountains {...props} />,
  path: (props) => <Path {...props} />,
  upATree: (props) => <UpATree {...props} />,
  gratingClearing: (props) => <GratingClearing {...props} />,
  clearing: (props) => <Clearing {...props} />,
  canyonView: (props) => <CanyonView {...props} />,
  cliffMiddle: (props) => <CliffMiddle {...props} />,
  canyonBottom: (props) => <CanyonBottom {...props} />,
  endOfRainbow: (props) => <EndOfRainbow {...props} />,
  gratingRoom: (props) => <GratingRoom {...props} />,
  cyclopsRoom: (props) => <CyclopsRoom {...props} />,
  strangePassage: (props) => <StrangePassage {...props} />,
  treasureRoom: (props) => <TreasureRoom {...props} />,
  ...Object.fromEntries(
    MAZE_ROOM_IDS.map((id) => [id, (props) => <MazeRoom roomId={id} {...props} />])
  ),
  ...Object.fromEntries(DEAD_END_IDS.map((id) => [id, (props) => <MazeDeadEnd {...props} />])),
};
