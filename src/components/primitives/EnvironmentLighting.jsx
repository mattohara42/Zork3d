import { Sky } from '@react-three/drei';
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
          {/* Real sky dome instead of a flat background color - the sun
              position is tuned for a warm, slightly low midday angle so
              every surface room gets soft directional shadows rather
              than a flat noon wash. */}
          <Sky sunPosition={[40, 45, -60]} turbidity={3} rayleigh={1.5} mieCoefficient={0.003} />
          <ambientLight intensity={0.55} color="#cfe8ff" />
          <directionalLight
            position={[8, 12, 6]}
            intensity={1.1}
            color="#fff4e0"
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
            {/* A dim, cool fill on top of the lantern's warm local pool -
                stands in for eyes adjusted to the dark (real scotopic
                vision skews blue/desaturated), so cave walls a few
                meters out read as dark shapes instead of pure black. */}
            <ambientLight intensity={0.9} color="#2a3a4a" />
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
