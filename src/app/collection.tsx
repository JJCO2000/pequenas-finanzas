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

const HIDDEN_FINDS = [
  { id: 'rib-bone', glyph: '🦴', title: 'Costilla fósil' },
  { id: 'ancient-tooth', glyph: '🦷', title: 'Diente antiguo' },
  { id: 'amber-stone', glyph: '🪨', title: 'Piedra de ámbar' },
  { id: 'lost-coin', glyph: '🪙', title: 'Moneda perdida' },
  { id: 'old-compass', glyph: '🧭', title: 'Brújula vieja' },
  { id: 'tiny-fossil', glyph: '🐚', title: 'Fósil diminuto' },
] as const;

export default function CollectionScreen() {
  const { inventory, settings } = useAppData();
  const { goBack } = useCampBack();
  const owned = new Set(inventory.map((item) => item.itemId));
  const ownedEggs = SHOP_ITEMS.filter((item) => owned.has(item.id)).length;
  const foundHidden = HIDDEN_FINDS.filter((item) => settings[`museum.find.${item.id}`] === '1').length;

  return (
    <WorldScene background={ACTIVE_THEME.destinations.collection.background} backgroundBlurRadius={ACTIVE_THEME.destinations.backgroundBlurRadius} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Museo" subtitle="Huevos, hallazgos ocultos y galería completa de retos." eyebrow="COLECCIÓN" hero={ACTIVE_THEME.destinations.collection.longneck} onBack={goBack} />
        <HudPill label="HUEVOS" value={`${ownedEggs}/${SHOP_ITEMS.length}`} icon="★" tone="gold" />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
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
          <View>
            <Text style={styles.sectionText}>Hallazgos ocultos</Text>
            <Text style={styles.sectionSub}>Nueva vitrina para huesos y reliquias escondidas por mapa y juegos.</Text>
          </View>
          <View style={styles.counter}><Text style={styles.counterText}>{foundHidden}/{HIDDEN_FINDS.length}</Text></View>
        </View>

        <ScrollView horizontal style={styles.findsScroll} contentContainerStyle={styles.finds} showsHorizontalScrollIndicator={false}>
          {HIDDEN_FINDS.map((item) => {
            const found = settings[`museum.find.${item.id}`] === '1';
            return (
              <View key={item.id} style={[styles.findCard, found && styles.findCardFound]}>
                <View style={[styles.findArtifact, !found && styles.findArtifactHidden]}><Text style={styles.findGlyph}>{item.glyph}</Text></View>
                <Text numberOfLines={1} style={styles.findName}>{found ? item.title : '???'}</Text>
                <Text style={styles.findState}>{found ? 'DESCUBIERTO' : 'OCULTO'}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionText}>Galería Arcade</Text><Text style={styles.sectionSub}>Los 7 juegos son libres. Aquí se exhiben; no se bloquean.</Text></View>
          <View style={styles.counter}><Text style={styles.counterText}>7/7</Text></View>
        </View>

        <ScrollView horizontal style={styles.gamesScroll} contentContainerStyle={styles.games} showsHorizontalScrollIndicator={false}>
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
      </ScrollView>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  body: { flex: 1, minHeight: 0 },
  bodyContent: { paddingBottom: 8, gap: 6 },
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
  findsScroll: { minHeight: 82 },
  finds: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingVertical: 2 },
  findCard: { width: 92, height: 78, borderRadius: 16, backgroundColor: 'rgba(255,253,244,0.94)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, ...shadows.soft },
  findCardFound: { borderColor: '#FFD54F', transform: [{ translateY: -1 }] },
  findArtifact: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0C8', borderWidth: 1.5, borderColor: '#E7C76C' },
  findArtifactHidden: { opacity: 0.22, backgroundColor: '#DDE7DD', borderColor: '#AEB8AE' },
  findGlyph: { fontSize: 22, lineHeight: 25 },
  findName: { color: colors.forestDark, fontSize: 6.5, lineHeight: 8, fontWeight: '900', marginTop: 2, maxWidth: 78, textAlign: 'center' },
  findState: { color: colors.inkMuted, fontSize: 4.5, lineHeight: 6, fontWeight: '900', letterSpacing: 0.5, marginTop: 1 },
  gamesScroll: { minHeight: 98 },
  games: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 3 },
  gameTile: { width: 118, height: 92 },
});
