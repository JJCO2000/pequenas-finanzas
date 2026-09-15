import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HOME_COMPACT_MAX_WIDTH = 900;
export const HOME_COMPACT_MAX_HEIGHT = 500;
export const HOME_EXPANDED_MIN_WIDTH = 1600;
export const HOME_EXPANDED_MIN_HEIGHT = 900;
export const HOME_MIN_TOUCH_TARGET = 48;
export const HOME_DESTINATION_PANEL_BORDER_WIDTH = 3;

export type HomeLayoutMode = 'compact' | 'regular' | 'expanded';

export type HomeLayout = {
  mode: HomeLayoutMode;
  safeWidth: number;
  safeHeight: number;
  insetLeft: number;
  insetRight: number;
  insetTop: number;
  insetBottom: number;
  contentWidth: number;
  contentHeight: number;
  gutter: number;
  gap: number;
  fontScale: number;
  topBarHeight: number;
  destinationPanelWidth: number;
  destinationPanelPadding: number;
  destinationPanelBorderWidth: number;
  destinationGap: number;
  destinationCardWidth: number;
  destinationCardHeight: number;
  missionHeight: number;
  missionMaxWidth: number;
  touchTarget: number;
  backgroundFit: 'cover';
  backgroundPosition: 'center';
};

export function resolveHomeLayout(width: number, height: number, insetLeft = 0, insetRight = 0, insetTop = 0, insetBottom = 0): HomeLayout {
  const safeWidth = Math.max(1, width - insetLeft - insetRight);
  const safeHeight = Math.max(1, height - insetTop - insetBottom);

  const mode: HomeLayoutMode =
    safeHeight < HOME_COMPACT_MAX_HEIGHT || safeWidth < HOME_COMPACT_MAX_WIDTH
      ? 'compact'
      : safeWidth >= HOME_EXPANDED_MIN_WIDTH && safeHeight >= HOME_EXPANDED_MIN_HEIGHT
        ? 'expanded'
        : 'regular';

  const gutter = mode === 'compact' ? 10 : mode === 'expanded' ? 28 : 20;
  const gap = mode === 'compact' ? 8 : mode === 'expanded' ? 16 : 12;
  const fontScale = mode === 'compact' ? 0.9 : mode === 'expanded' ? 1.08 : 1;
  const contentWidth = Math.max(1, safeWidth - gutter * 2);
  const contentHeight = Math.max(1, safeHeight - gutter * 2);
  const topBarHeight = mode === 'compact' ? 56 : mode === 'expanded' ? 104 : 92;
  const destinationPanelPadding = mode === 'compact' ? 8 : mode === 'expanded' ? 24 : 22;
  const destinationPanelBorderWidth = HOME_DESTINATION_PANEL_BORDER_WIDTH;
  const destinationGap = mode === 'compact' ? 6 : mode === 'expanded' ? 18 : 18;
  const destinationPanelWidth = mode === 'compact'
    ? Math.min(320, Math.max(188, contentWidth * 0.42))
    : mode === 'expanded'
      ? Math.min(660, contentWidth * 0.32)
      : Math.min(600, Math.max(420, contentWidth * 0.39));
  const destinationCardWidth = Math.max(
    HOME_MIN_TOUCH_TARGET,
    (
      destinationPanelWidth
      - destinationPanelBorderWidth * 2
      - destinationPanelPadding * 2
      - destinationGap * 2
    ) / 3,
  );
  const destinationCardHeight = mode === 'compact' ? 64 : mode === 'expanded' ? 196 : 186;
  const missionHeight = mode === 'compact'
    ? 128
    : mode === 'expanded'
      ? 260
      : Math.min(250, Math.max(210, contentHeight * 0.3));
  const missionMaxWidth = mode === 'compact' ? 760 : mode === 'expanded' ? 1160 : 1040;

  return {
    mode,
    safeWidth,
    safeHeight,
    insetLeft,
    insetRight,
    insetTop,
    insetBottom,
    contentWidth,
    contentHeight,
    gutter,
    gap,
    fontScale,
    topBarHeight,
    destinationPanelWidth,
    destinationPanelPadding,
    destinationPanelBorderWidth,
    destinationGap,
    destinationCardWidth,
    destinationCardHeight,
    missionHeight,
    missionMaxWidth,
    touchTarget: HOME_MIN_TOUCH_TARGET,
    backgroundFit: 'cover',
    backgroundPosition: 'center',
  };
}

export function useHomeLayout(): HomeLayout {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(
    () => resolveHomeLayout(width, height, insets.left, insets.right, insets.top, insets.bottom),
    [height, insets.bottom, insets.left, insets.right, insets.top, width],
  );
}
