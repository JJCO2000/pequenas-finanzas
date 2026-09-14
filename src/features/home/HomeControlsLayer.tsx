import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { HOME_DESTINATIONS } from './homeDestinations';
import { HomeDestinationCard } from './components/HomeDestinationCard';
import { HomeMissionCard, type HomeMissionViewModel } from './components/HomeMissionCard';
import type { HomeLayout } from './useHomeLayout';

type Props = {
  layout: HomeLayout;
  profileName: string;
  day: number;
  balanceLabel: string;
  avatar: React.ComponentProps<typeof Image>['source'];
  mission: HomeMissionViewModel;
};

export function HomeControlsLayer({ layout, profileName, day, balanceLabel, avatar, mission }: Props) {
  const compact = layout.mode === 'compact';
  const expanded = layout.mode === 'expanded';

  return (
    <View
      testID="home-controls-layer"
      style={[
        styles.safeLayer,
        {
          paddingLeft: layout.insetLeft + layout.gutter,
          paddingRight: layout.insetRight + layout.gutter,
          paddingTop: layout.insetTop + layout.gutter,
          paddingBottom: layout.insetBottom + layout.gutter,
          gap: layout.gap,
        },
      ]}
    >
      <View style={[styles.topBar, { height: layout.topBarHeight, gap: layout.gap }]}> 
        <View style={[styles.header, { borderRadius: compact ? 20 : 30, paddingHorizontal: compact ? 9 : 14 }]}> 
          <Image source={avatar} contentFit="contain" style={{ width: compact ? 40 : 64, height: compact ? 40 : 64 }} />
          <View style={styles.headerCopy}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.headerTitle, { fontSize: (compact ? 19 : 32) * layout.fontScale }]}>Pequeñas Finanzas</Text>
            {!compact ? <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.headerSubtitle, { fontSize: 15 * layout.fontScale }]}>Hola, {profileName} · ¿Listo para continuar?</Text> : null}
          </View>
        </View>

        <View style={[styles.stats, { gap: compact ? 6 : 10 }]}> 
          <View style={[styles.statPill, { minHeight: layout.touchTarget, paddingHorizontal: compact ? 8 : 13 }]}> 
            <Text style={[styles.star, { fontSize: compact ? 22 : 32 }]}>★</Text>
            <Text style={[styles.statValue, { fontSize: (compact ? 16 : 24) * layout.fontScale }]}>{day}</Text>
          </View>
          <View style={[styles.moneyPill, { minHeight: layout.touchTarget, paddingHorizontal: compact ? 8 : 13 }]}> 
            <Text style={[styles.moneyMark, { fontSize: compact ? 17 : 23 }]}>$</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.moneyValue, { fontSize: (compact ? 15 : 22) * layout.fontScale }]}>{balanceLabel}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.body, { gap: layout.gap }]}> 
        <View style={styles.leftColumn}>
          {!compact ? (
            <View pointerEvents="none" style={styles.nextStepWrap}>
              <View style={[styles.nextStep, { paddingHorizontal: expanded ? 22 : 18, paddingVertical: expanded ? 12 : 10 }]}> 
                <Text style={[styles.nextKicker, { fontSize: 12 * layout.fontScale }]}>SIGUIENTE PASO</Text>
                <Text style={[styles.nextText, { fontSize: 20 * layout.fontScale }]}>Tu misión está lista ↓</Text>
              </View>
            </View>
          ) : <View style={styles.compactSpacer} />}

          <HomeMissionCard mission={mission} layout={layout} onPress={() => router.replace('/play' as any)} />
        </View>

        <View
          testID="home-destination-panel"
          style={[
            styles.destinationPanel,
            {
              width: layout.destinationPanelWidth,
              borderRadius: compact ? 18 : 28,
              padding: layout.destinationPanelPadding,
            },
          ]}
        >
          <Text style={[styles.destinationTitle, { fontSize: (compact ? 13 : 21) * layout.fontScale, marginBottom: compact ? 5 : 10 }]}>OTROS LUGARES</Text>
          <View style={[styles.destinationGrid, { gap: layout.destinationGap }]}> 
            {HOME_DESTINATIONS.map((destination) => (
              <HomeDestinationCard
                key={destination.id}
                destination={destination}
                layout={layout}
                onPress={() => {
                  if (destination.navigation === 'replace') router.replace(destination.route as any);
                  else router.push(destination.route as any);
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeLayer: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'stretch' },
  header: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(2, 63, 43, 0.95)',
    borderWidth: 2,
    borderColor: '#79D66B',
  },
  headerCopy: { flex: 1, minWidth: 0 },
  headerTitle: { color: '#FFFFFF', fontWeight: '900' },
  headerSubtitle: { color: '#D6E9DC', fontWeight: '600', marginTop: 1 },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statPill: {
    height: '100%',
    maxHeight: 72,
    minWidth: 76,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F0B83D',
    backgroundColor: 'rgba(74, 53, 11, 0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  star: { color: '#FFD34D', fontWeight: '900' },
  statValue: { color: '#FFFFFF', fontWeight: '900' },
  moneyPill: {
    height: '100%',
    maxHeight: 72,
    minWidth: 116,
    maxWidth: 210,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#79D66B',
    backgroundColor: 'rgba(2, 63, 43, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  moneyMark: { color: '#FFFFFF', fontWeight: '900', backgroundColor: '#2A9B5E', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  moneyValue: { color: '#FFFFFF', fontWeight: '900', flexShrink: 1 },
  body: { flex: 1, minHeight: 0, flexDirection: 'row' },
  leftColumn: { flex: 1, minWidth: 0, justifyContent: 'space-between' },
  compactSpacer: { flex: 1 },
  nextStepWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nextStep: { borderRadius: 999, backgroundColor: 'rgba(243, 255, 222, 0.95)', borderWidth: 2, borderColor: '#79D66B', alignItems: 'center' },
  nextKicker: { color: '#2B6338', fontWeight: '900', letterSpacing: 1.1 },
  nextText: { color: '#153E2A', fontWeight: '900', marginTop: 1 },
  destinationPanel: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(8, 66, 45, 0.95)',
    borderWidth: 3,
    borderColor: '#79D66B',
    overflow: 'hidden',
  },
  destinationTitle: { color: '#FFFFFF', fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 },
  destinationGrid: { flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center' },
});
