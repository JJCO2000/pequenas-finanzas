import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { AdventureMapScreen } from '@/features/adventure/AdventureMapScreen';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';

export default function PlayRoute() {
  const { profile, adventureDays, refresh } = useAppData();
  const [waitedTooLong, setWaitedTooLong] = useState(false);

  useEffect(() => {
    if (!profile || adventureDays.length > 0) {
      setWaitedTooLong(false);
      return;
    }
    const timer = setTimeout(() => setWaitedTooLong(true), 2600);
    return () => clearTimeout(timer);
  }, [adventureDays.length, profile]);

  if (profile && adventureDays.length > 0) return <AdventureMapScreen />;
  return <AdventureMapBoot stalled={waitedTooLong} onRetry={() => void refresh()} />;
}

function AdventureMapBoot({ stalled, onRetry }: { stalled: boolean; onRetry: () => void }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 720, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 760, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.root}>
      <ExpoImage source={ACTIVE_THEME.destinations.map.background} contentFit="cover" cachePolicy="memory-disk" blurRadius={ACTIVE_THEME.destinations.backgroundBlurRadius} style={StyleSheet.absoluteFill} />
      <View style={styles.tint} />
      <Image source={ACTIVE_THEME.world.mapVolcano} resizeMode="contain" style={styles.volcano} />
      <Image source={ACTIVE_THEME.world.mapIslands} resizeMode="contain" style={styles.islands} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mapa de aventuras</Text>
        <Text style={styles.headerMeta}>{stalled ? 'PARTIDA LOCAL DISPONIBLE' : 'PREPARANDO TU EXPEDICIÓN'}</Text>
      </View>
      <View style={styles.routePreview}>
        {[0, 1, 2, 3, 4].map((index) => (
          <React.Fragment key={index}>
            {index > 0 ? <View style={styles.routeDash} /> : null}
            <Animated.View style={[styles.node, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45 + index * 0.05, 0.95] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] }) }] }]}>
              <Text style={styles.nodeText}>D{index + 1}</Text>
            </Animated.View>
          </React.Fragment>
        ))}
      </View>
      <View style={styles.bootCard}>
        <Text style={styles.bootEyebrow}>{stalled ? 'NO TE DEJAMOS ATRAPADO' : 'CARGANDO PARTIDA LOCAL'}</Text>
        <Text style={styles.bootTitle}>{stalled ? 'El mapa tardó más de lo normal.' : 'Preparando caminos, retos y recompensas…'}</Text>
        <Text style={styles.bootCopy}>{stalled ? 'Reintenta la lectura local. Esto no necesita internet.' : 'El mapa aparecerá completo; no necesitas tocar ni mover la pantalla para que termine de cargar.'}</Text>
        {stalled ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Reintentar abrir mapa" onPress={onRetry} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
            <Text style={styles.retryText}>REINTENTAR MAPA →</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.aqua, overflow: 'hidden' },
  tint: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,88,80,0.14)' },
  volcano: { position: 'absolute', width: 122, height: 92, left: 36, top: 68, opacity: 0.78 },
  islands: { position: 'absolute', width: 180, height: 116, right: 58, bottom: 40, opacity: 0.7 },
  header: { position: 'absolute', top: 10, alignSelf: 'center', alignItems: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, lineHeight: 20, fontWeight: '900', textShadowColor: 'rgba(0,50,42,0.45)', textShadowRadius: 5 },
  headerMeta: { color: '#FFE06E', fontSize: 7, fontWeight: '900', letterSpacing: 1.4, marginTop: 3 },
  routePreview: { position: 'absolute', left: '24%', right: '24%', top: '42%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  routeDash: { flex: 1, minWidth: 22, height: 3, borderRadius: 2, backgroundColor: 'rgba(14,75,57,0.58)' },
  node: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFDF1', borderWidth: 4, borderColor: '#FFD34E', alignItems: 'center', justifyContent: 'center', ...shadows.card },
  nodeText: { color: colors.forestDark, fontSize: 9, fontWeight: '900' },
  bootCard: { position: 'absolute', alignSelf: 'center', bottom: 24, width: '48%', minWidth: 360, borderRadius: radii.xl, backgroundColor: 'rgba(7,70,51,0.94)', borderWidth: 2, borderColor: '#CDE9C4', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', ...shadows.card },
  bootEyebrow: { color: colors.gold, fontSize: 6.5, fontWeight: '900', letterSpacing: 1 },
  bootTitle: { color: colors.white, fontSize: 12, lineHeight: 14, fontWeight: '900', marginTop: 2, textAlign: 'center' },
  bootCopy: { color: '#DDEFD8', fontSize: 7, lineHeight: 9, fontWeight: '700', marginTop: 3, textAlign: 'center' },
  retry: { marginTop: 8, minWidth: 150, height: 30, borderRadius: radii.pill, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  retryText: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900' },
  pressed: { transform: [{ scale: 0.97 }] },
});
