import LanternLight from './LanternLight';

/**
 * Room lighting keyed on the room's environment plus whether it's
 * naturally lit. `naturallyLit` is the one addition beyond the literal
 * surface/underground switch: the Gallery is 'underground' but ONBIT in
 * the source, so it still needs the bright rig rather than being forced
 * into the lantern-only branch just for being underground.
 */
export default function EnvironmentLighting({ environment, naturallyLit, lanternLit }) {
  switch (environment) {
    case 'surface':
      return (
        <>
          <ambientLight intensity={0.6} color="#cfe8ff" />
          <directionalLight
            position={[8, 12, 6]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
            shadow-camera-near={0.1}
            shadow-camera-far={30}
          />
        </>
      );

    case 'underground':
      if (naturallyLit) {
        return (
          <>
            <ambientLight intensity={0.6} color="#cfe8ff" />
            <directionalLight position={[8, 12, 6]} intensity={0.8} />
          </>
        );
      }
      if (lanternLit) {
        return (
          <>
            <ambientLight intensity={0.05} />
            <LanternLight />
          </>
        );
      }
      // Pitch black: no lights at all, matching "eaten by a grue."
      return null;

    default:
      return null;
  }
}
