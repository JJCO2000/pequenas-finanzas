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
          <View style={[styles.statPill, { minHeight: layout.touchTarget, paddingHorizontal: compact ? 8 : 15 }]}> 
            <Text style={[styles.star, { fontSize: compact ? 22 : 32 }]}>★</Text>
            <Text style={[styles.statValue, { fontSize: (compact ? 16 : 24) * layout.fontScale }]}>{day}</Text>
          </View>
          <View style={[styles.moneyPill, { minHeight: layout.touchTarget, paddingHorizontal: compact ? 8 : 15 }]}> 
            <Text style={[styles.moneyMark, { fontSize: compact ? 17 : 23 }]}>$</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.moneyValue, { fontSize: (compact ? 15 : 22) * layout.fontScale }]}>{balanceLabel}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.body, { gap: layout.gap }]}> 
        <View style={styles.leftColumn}>
          {!compact ? (
            <View pointerEvents="none" style={styles.nextStepWrap}>
              <View style={[styles.nextStep, { paddingHorizontal: expanded ? 25 : 21, paddingVertical: expanded ? 13 : 11 }]}> 
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
              borderWidth: layout.destinationPanelBorderWidth,
              borderRadius: compact ? 18 : expanded ? 32 : 29,
              padding: layout.destinationPanelPadding,
              marginTop: layout.destinationPanelTopOffset,
              alignSelf: compact ? 'stretch' : 'flex-start',
            },
          ]}
        >
          {compact ? (
            <View style={[styles.destinationCompactHeader, { marginBottom: 5 }]}> 
              <Text style={[styles.destinationCompactTitle, { fontSize: 12.5 * layout.fontScale }]}>OTROS LUGARES</Text>
            </View>
          ) : (
            <View style={[styles.destinationHeader, { marginBottom: expanded ? 24 : 22 }]}> 
              <View style={styles.destinationHeadingCopy}>
                <Text style={[styles.destinationKicker, { fontSize: (expanded ? 12 : 11) * layout.fontScale }]}>CAMPAMENTO</Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.destinationTitle,
                    {
                      fontSize: (expanded ? 27 : 24) * layout.fontScale,
                      lineHeight: (expanded ? 31 : 28) * layout.fontScale,
                    },
                  ]}
                >
                  Otros lugares
                </Text>
              </View>
              <View style={styles.destinationHelper}>
                <Text style={[styles.destinationKicker, { fontSize: (expanded ? 11 : 10) * layout.fontScale }]}>EXPLORA</Text>
                <Text style={[styles.destinationHint, { fontSize: (expanded ? 11 : 10) * layout.fontScale }]}>Toca una tarjeta.</Text>
              </View>
            </View>
          )}

          <View
            style={[
              styles.destinationGrid,
              {
                columnGap: layout.destinationGap,
                rowGap: layout.destinationRowGap,
              },
            ]}
          > 
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
    shadowColor: '#062F23',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  headerTitle: { color: '#FFFFFF', fontWeight: '900' },
  headerSubtitle: { color: '#E4F3DD', fontWeight: '700', marginTop: 1 },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statPill: {
    height: '100%',
    maxHeight: 72,
    minWidth: 88,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F2C94C',
    backgroundColor: '#FFF1A8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#6D5420',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  star: { color: '#F2A900', fontWeight: '900' },
  statValue: { color: '#163D2D', fontWeight: '900' },
  moneyPill: {
    height: '100%',
    maxHeight: 72,
    minWidth: 126,
    maxWidth: 220,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#D8F4B5',
    backgroundColor: '#FFFDF3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: '#123F2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  moneyMark: {
    color: '#FFFFFF',
    fontWeight: '900',
    backgroundColor: '#2D9E58',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#5DCB6C',
  },
  moneyValue: { color: '#12462F', fontWeight: '900', flexShrink: 1 },
  body: { flex: 1, minHeight: 0, flexDirection: 'row' },
  leftColumn: { flex: 1, minWidth: 0, justifyContent: 'space-between' },
  compactSpacer: { flex: 1 },
  nextStepWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nextStep: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 252, 231, 0.97)',
    borderWidth: 3,
    borderColor: '#F1D66B',
    alignItems: 'center',
    shadowColor: '#745B1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  nextKicker: { color: '#B56A20', fontWeight: '900', letterSpacing: 1.1 },
  nextText: { color: '#153E2A', fontWeight: '900', marginTop: 1 },
  destinationPanel: {
    backgroundColor: 'rgba(3, 72, 49, 0.985)',
    borderColor: '#8CE36A',
    overflow: 'hidden',
    shadowColor: '#062F23',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 9,
    elevation: 7,
  },
  destinationCompactHeader: { minHeight: 14, justifyContent: 'center' },
  destinationCompactTitle: { color: '#FFFFFF', fontWeight: '900', textAlign: 'center', letterSpacing: 0.55 },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 2,
    paddingTop: 8,
  },
  destinationHeadingCopy: { flex: 1, minWidth: 0 },
  destinationHelper: { alignItems: 'flex-end', paddingTop: 1, maxWidth: '38%' },
  destinationKicker: { color: '#F6D95D', fontWeight: '900', letterSpacing: 1.12 },
  destinationTitle: { color: '#FFFFFF', fontWeight: '900', marginTop: 1 },
  destinationHint: { color: '#F0F6E9', fontWeight: '700', marginTop: 2, textAlign: 'right' },
  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
  },
});
