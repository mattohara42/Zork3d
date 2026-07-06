import { useMemo } from 'react';

// Shared look for every mesh in this kit: high roughness + flat shading
// reads as stylized low-poly stonework/wood/metal rather than the
// smooth, glossy default meshStandardMaterial gives you. Centralized
// here so every component in the kit stays visually consistent without
// repeating the same two props on every <meshStandardMaterial> tag -
// that consistency is the actual point of a shared "visual kit".
function KitMaterial({ color, metalness = 0 }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={0.9} flatShading={true} />;
}

// Darkens a "#rrggbb" color by a multiplicative factor (0-1) - used to
// derive a stone block's shadow-toned variant from a wall's base color
// without needing a second color prop on every caller.
function shade(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (c) => Math.min(255, Math.max(0, Math.round(c * factor)));
  const r = clamp((n >> 16) & 255);
  const g = clamp((n >> 8) & 255);
  const b = clamp(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

// Fixed (not random) relative offsets for the clustered stone blocks, as
// fractions of the wall's own height/depth so they scale to whatever
// size wall they're applied to. Hand-picked for an irregular, non-
// repeating look rather than a generator - four blocks is few enough
// that hardcoding reads clearer than a seeded RNG would.
const STONE_BLOCKS = [
  { yFrac: -0.26, zFrac: -0.3, hFrac: 0.34, dFrac: 0.16, tilt: 0.06 },
  { yFrac: 0.2, zFrac: -0.06, hFrac: 0.26, dFrac: 0.12, tilt: -0.05 },
  { yFrac: -0.06, zFrac: 0.22, hFrac: 0.3, dFrac: 0.15, tilt: 0.04 },
  { yFrac: 0.3, zFrac: 0.34, hFrac: 0.22, dFrac: 0.1, tilt: -0.07 },
];

/**
 * A stone dungeon wall: one main slab plus 3-4 smaller, darker blocks
 * clustered on its face to break up the flat surface into irregular
 * "stonework" without needing a texture. `position` is the slab's
 * center, matching how every room already positions a plain wall
 * `<mesh>` today - this is meant as a drop-in replacement for one.
 *
 * The stone blocks are sized slightly *wider* than the wall itself
 * (along the wall's thickness axis) and centered on the same axis, so
 * they protrude evenly from whichever face ends up facing the camera -
 * this component doesn't need to know which side of the wall that is.
 */
export function DungeonWall({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.2,
  height = 3,
  depth = 9,
  color = '#4a453f',
}) {
  const blockColor = useMemo(() => shade(color, 0.65), [color]);

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <KitMaterial color={color} />
      </mesh>
      {STONE_BLOCKS.map((b, i) => (
        <mesh key={i} castShadow position={[0, height * b.yFrac, depth * b.zFrac]} rotation={[0, 0, b.tilt]}>
          <boxGeometry args={[width * 1.5, height * b.hFrac, depth * b.dFrac]} />
          <KitMaterial color={blockColor} />
        </mesh>
      ))}
    </group>
  );
}

const ARCH_SEGMENTS = 7;

/**
 * A stone archway built entirely from rotated box primitives - no curved
 * geometry. Two jambs (vertical posts) carry a fan of thin radial
 * "voussoir" blocks: each sits in its own group, offset upward by the
 * arch's radius and rotated a bit further around the pivot where the
 * jambs meet, the standard low-poly trick for faking a curve out of
 * straight pieces. Origin is at floor level (the threshold), matching
 * how doorway-shaped openings are otherwise positioned in this game
 * (`position={[x, GROUND_Y, z]}` from the calling room).
 */
export function ArchedDoorway({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 1.8,
  height = 2.2,
  thickness = 0.4,
  color = '#5a5248',
  openingColor = '#050505',
}) {
  const jambWidth = thickness * 0.9;
  const archRadius = width / 2 + jambWidth / 2;
  const voussoirThickness = archRadius * 0.4;
  // Arc length per segment - close enough to a snug fan of blocks
  // without needing exact chord-length trigonometry for a stylized asset.
  const voussoirChord = (Math.PI * archRadius) / ARCH_SEGMENTS;

  const archAngles = useMemo(() => {
    const angles = [];
    for (let i = 0; i < ARCH_SEGMENTS; i++) {
      angles.push(-Math.PI / 2 + (i / (ARCH_SEGMENTS - 1)) * Math.PI);
    }
    return angles;
  }, []);

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[-archRadius, height / 2, 0]}>
        <boxGeometry args={[jambWidth, height, thickness]} />
        <KitMaterial color={color} />
      </mesh>
      <mesh castShadow position={[archRadius, height / 2, 0]}>
        <boxGeometry args={[jambWidth, height, thickness]} />
        <KitMaterial color={color} />
      </mesh>

      {archAngles.map((angle, i) => (
        <group key={i} position={[0, height, 0]} rotation={[0, 0, angle]}>
          {/* Offsetting along local Y and rotating the wrapping group
              (rather than the mesh itself) is what makes this block both
              orbit the pivot *and* end up angled tangent to the curve,
              exactly like a real wedge-shaped arch stone. */}
          <mesh castShadow position={[0, archRadius, 0]}>
            <boxGeometry args={[voussoirChord, voussoirThickness, thickness]} />
            <KitMaterial color={color} />
          </mesh>
        </group>
      ))}

      {/* A flat dark backing fills the opening so it reads as a passage
          into darkness rather than a hole into the empty scene
          background - pass a lighter `openingColor` if what's beyond
          should look occupied instead of unexplored. Rectangular rather
          than arch-shaped since the jambs/voussoirs in front already
          define the visible silhouette from straight on. */}
      <mesh position={[0, (height + archRadius) / 2, -thickness / 2 - 0.02]}>
        <planeGeometry args={[width, height + archRadius]} />
        <KitMaterial color={openingColor} />
      </mesh>
    </group>
  );
}

/**
 * A wooden treasure chest with gold trim. `isOpen` swings the lid back
 * on a hinge at the rear edge and reveals a dark interior floor - the
 * same "swap position+rotation on the state" technique the mailbox's
 * lid already uses elsewhere in this game, just rotated around a pivot
 * group instead of the mesh directly, since a chest's lid arcs through
 * a much bigger angle than the mailbox's. Origin is at floor level.
 */
export function TreasureChest({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 1.1,
  depth = 0.7,
  baseHeight = 0.55,
  isOpen = false,
  woodColor = '#5a3a22',
  goldColor = '#c9a227',
}) {
  const lidHeight = baseHeight * 0.5;

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, baseHeight / 2, 0]}>
        <boxGeometry args={[width, baseHeight, depth]} />
        <KitMaterial color={woodColor} />
      </mesh>

      {/* Two gold bands wrapping the base - thin cylinders laid on their
          side so they read as a metal strip running across the wood
          rather than a post standing on it. */}
      {[0.28, 0.78].map((frac, i) => (
        <mesh key={i} castShadow rotation={[0, 0, Math.PI / 2]} position={[0, baseHeight * frac, depth / 2 + 0.01]}>
          <cylinderGeometry args={[0.04, 0.04, width + 0.06, 6]} />
          <KitMaterial color={goldColor} metalness={1} />
        </mesh>
      ))}

      {/* Lock plate, mounted on the base so it stays put regardless of
          whether the lid above it is open or closed. */}
      <mesh castShadow position={[0, baseHeight * 0.55, depth / 2 + 0.06]}>
        <boxGeometry args={[0.16, 0.18, 0.06]} />
        <KitMaterial color={goldColor} metalness={1} />
      </mesh>

      {/* The pivot sits at the rear top edge of the base - real hinge
          position - so rotating this group swings the lid through an
          arc instead of just repositioning it. */}
      <group position={[0, baseHeight, -depth / 2]} rotation={[isOpen ? -Math.PI / 1.6 : 0, 0, 0]}>
        <mesh castShadow position={[0, lidHeight / 2, depth / 2]}>
          <boxGeometry args={[width, lidHeight, depth]} />
          <KitMaterial color={woodColor} />
        </mesh>
      </group>

      {isOpen && (
        <mesh position={[0, baseHeight - 0.02, 0]}>
          <boxGeometry args={[width - 0.12, 0.04, depth - 0.12]} />
          <KitMaterial color="#100a06" />
        </mesh>
      )}
    </group>
  );
}
