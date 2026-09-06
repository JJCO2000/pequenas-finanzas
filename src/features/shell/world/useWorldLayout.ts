import { useWindowDimensions } from 'react-native';

/**
 * Reference composition used by the approved 1672x941 visual masters.
 *
 * The important rule is uniform scaling. We never stretch X and Y independently.
 * The scale is the smaller of width/height fit, so the reference composition always
 * fits and any extra aspect-ratio space becomes additional visible world.
 */
export const WORLD_REFERENCE_WIDTH = 1672;
export const WORLD_REFERENCE_HEIGHT = 941;

export type WorldLayout = {
  physicalWidth: number;
  physicalHeight: number;
  scale: number;
  logicalWidth: number;
  logicalHeight: number;
  extraLogicalWidth: number;
  extraLogicalHeight: number;
  physicalToLogicalX: (x: number) => number;
  physicalToLogicalY: (y: number) => number;
  logicalToPhysical: (value: number) => number;
};

export function getWorldLayout(width: number, height: number): WorldLayout {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const scale = Math.max(
    0.001,
    Math.min(safeWidth / WORLD_REFERENCE_WIDTH, safeHeight / WORLD_REFERENCE_HEIGHT),
  );
  const logicalWidth = safeWidth / scale;
  const logicalHeight = safeHeight / scale;

  return {
    physicalWidth: safeWidth,
    physicalHeight: safeHeight,
    scale,
    logicalWidth,
    logicalHeight,
    extraLogicalWidth: Math.max(0, logicalWidth - WORLD_REFERENCE_WIDTH),
    extraLogicalHeight: Math.max(0, logicalHeight - WORLD_REFERENCE_HEIGHT),
    physicalToLogicalX: (x: number) => x / scale,
    physicalToLogicalY: (y: number) => y / scale,
    logicalToPhysical: (value: number) => value * scale,
  };
}

export function useWorldLayout() {
  const { width, height } = useWindowDimensions();
  return getWorldLayout(width, height);
}
