import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '@/features/session/AppDataProvider';
import { SHOP_ITEMS } from '@/registry/shop';
import { GAMES } from '@/registry/games';
import { getGamePresentation } from '@/registry/gamePresentation';
import { ACTIVE_THEME } from '@/core/theme';
import { useCampBack } from '@/features/shell/navigation/useCampBack';
import { CollectibleEgg, WorldScene } from '@/features/shell/world';
import { CompactHeader, GameTile, HudPill } from '@/features/shell/gameui';
import { colors, radii, shadows } from '@/core/theme/tokens';

const EGG_ACCENTS: Record<string, string> = {
  'egg-forest': '#69A95D', 'egg-sunset': '#E67F50', 'egg-ocean': '#59A7C8', 'egg-volcano': '#B576C2',
};

export default function CollectionScreen() {
  const { inventory } = useAppData();
  const { goBack } = useCampBack();
  const owned = new Set(inventory.map((item) => item.itemId));
  const ownedEggs = SHOP_ITEMS.filter((item) => owned.has(item.id)).length;

  return (
    <WorldScene background={ACTIVE_THEME.world.camp ?? ACTIVE_THEME.world.shop} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Museo" subtitle="Tus huevos y la galería completa de retos." eyebrow="COLECCIÓN" hero={ACTIVE_THEME.shop.featuredItem} onBack={goBack} />
        <HudPill label="HUEVOS" value={`${ownedEggs}/${SHOP_ITEMS.length}`} icon="★" tone="gold" />
      </View>

      <View style={styles.sectionHeader}>
        <View><Text style={styles.sectionText}>Huevos de expedición</Text><Text style={styles.sectionSub}>Consíguelos en el Área de canje. Los que ya tienes se muestran a todo color.</Text></View>
        <View style={styles.counter}><Text style={styles.counterText}>{ownedEggs}/{SHOP_ITEMS.length}</Text></View>
      </View>

      <View style={styles.eggs}>
        {SHOP_ITEMS.map((item) => {
          const isOwned = owned.has(item.id);
          const accent = EGG_ACCENTS[item.id] ?? '#72AD54';
          return (
            <View key={item.id} style={[styles.egg, { borderColor: accent }, isOwned && styles.eggOwned]}>
              <View style={[styles.pedestalHalo, { backgroundColor: accent }]} />
              <CollectibleEgg source={item.art} accent={accent} size={58} selected={isOwned} />
              <Text numberOfLines={1} style={styles.eggName}>{isOwned ? item.title.replace('Huevo ', '') : '???'}</Text>
              <View style={[styles.pill, isOwned ? styles.pillOwned : styles.pillLocked]}><Text style={[styles.pillText, !isOwned && styles.pillTextLocked]}>{isOwned ? 'EN TU MUSEO' : 'POR CONSEGUIR'}</Text></View>
            </View>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <View><Text style={styles.sectionText}>Galería Arcade</Text><Text style={styles.sectionSub}>Los 7 juegos son libres. Aquí se exhiben; no se bloquean.</Text></View>
        <View style={styles.counter}><Text style={styles.counterText}>7/7</Text></View>
      </View>

      <ScrollView horizontal style={styles.scroll} contentContainerStyle={styles.games} showsHorizontalScrollIndicator={false}>
        {GAMES.map((game) => {
          const p = getGamePresentation(game.id);
          return (
            <GameTile
              key={game.id}
              art={ACTIVE_THEME.gameThumbnails?.[game.id] ?? p.hero}
              artBackground="#E8F4D8"
              title={p.title}
              badge="ARCADE"
              locked={false}
              style={styles.gameTile}
            />
          );
        })}
      </ScrollView>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 30, borderRadius: 14, backgroundColor: 'rgba(4,54,36,0.78)', paddingHorizontal: 10, paddingVertical: 5 },
  sectionText: { color: colors.white, fontSize: 8.5, fontWeight: '900' },
  sectionSub: { color: '#DCEED8', fontSize: 5.8, fontWeight: '700', marginTop: 1 },
  counter: { minWidth: 38, height: 22, borderRadius: radii.pill, backgroundColor: '#FFF0A8', alignItems: 'center', justifyContent: 'center' },
  counterText: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900' },
  eggs: { height: 112, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  egg: { width: 104, height: 102, borderRadius: 18, backgroundColor: 'rgba(255,253,244,0.96)', borderWidth: 2, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', ...shadows.soft },
  eggOwned: { transform: [{ translateY: -2 }] },
  pedestalHalo: { position: 'absolute', width: 78, height: 78, borderRadius: 39, opacity: 0.12 },
  eggName: { color: colors.forestDark, fontSize: 7.8, fontWeight: '900', maxWidth: 82, marginTop: 1 },
  pill: { marginTop: 2, borderRadius: radii.pill, paddingHorizontal: 6, paddingVertical: 2 },
  pillOwned: { backgroundColor: '#DDF0D4' },
  pillLocked: { backgroundColor: '#EEE9DD' },
  pillText: { color: colors.forestDark, fontSize: 4.8, fontWeight: '900' },
  pillTextLocked: { color: colors.inkMuted },
  scroll: { flex: 1, minHeight: 0 },
  games: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 3 },
  gameTile: { width: 118, height: 92 },
});
