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
  const { inventory, gameUnlocks } = useAppData();
  const { goBack } = useCampBack();
  const owned = new Set(inventory.map((item) => item.itemId));
  const unlocked = new Set(gameUnlocks.map((item) => item.gameId));
  const totalOwned = SHOP_ITEMS.filter((item) => owned.has(item.id)).length + GAMES.filter((game) => unlocked.has(game.id)).length;
  const total = SHOP_ITEMS.length + GAMES.length;

  return (
    <WorldScene background={ACTIVE_THEME.world.camp ?? ACTIVE_THEME.world.shop} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Museo" subtitle="Todo lo que has descubierto." eyebrow="COLECCIÓN" hero={ACTIVE_THEME.shop.featuredItem} onBack={goBack} />
        <HudPill label="DESCUBIERTO" value={`${totalOwned}/${total}`} icon="★" tone="gold" />
      </View>

      <View style={styles.sectionTitle}><Text style={styles.sectionText}>Huevos</Text></View>
      <View style={styles.eggs}>
        {SHOP_ITEMS.map((item) => {
          const isOwned = owned.has(item.id);
          return (
            <View key={item.id} style={[styles.egg, !isOwned && styles.locked]}>
              <CollectibleEgg source={item.art} accent={EGG_ACCENTS[item.id] ?? '#72AD54'} size={52} selected={isOwned} />
              <Text numberOfLines={1} style={styles.eggName}>{isOwned ? item.title.replace('Huevo ', '') : '?'}</Text>
              <View style={styles.pill}><Text style={styles.pillText}>{isOwned ? 'TUYO' : 'BLOQUEADO'}</Text></View>
            </View>
          );
        })}
      </View>

      <View style={styles.sectionTitle}><Text style={styles.sectionText}>Retos Arcade</Text></View>
      <ScrollView horizontal style={styles.scroll} contentContainerStyle={styles.games} showsHorizontalScrollIndicator={false}>
        {GAMES.map((game) => {
          const p = getGamePresentation(game.id);
          const isUnlocked = unlocked.has(game.id);
          return (
            <GameTile
              key={game.id}
              art={ACTIVE_THEME.gameThumbnails?.[game.id] ?? p.hero}
              artBackground="#E8F4D8"
              title={isUnlocked ? p.title : 'Por descubrir'}
              badge={isUnlocked ? p.badge : 'BLOQUEADO'}
              locked={!isUnlocked}
              style={styles.gameTile}
            />
          );
        })}
      </ScrollView>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8, gap: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { alignSelf: 'flex-start', borderRadius: 12, backgroundColor: 'rgba(4,54,36,0.74)', paddingHorizontal: 9, paddingVertical: 3 },
  sectionText: { color: colors.white, fontSize: 8.5, fontWeight: '900' },
  eggs: { height: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  egg: { width: 92, height: 84, borderRadius: 16, backgroundColor: 'rgba(255,253,244,0.94)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  locked: { opacity: 0.42 },
  eggName: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900', maxWidth: 76 },
  pill: { marginTop: 1, borderRadius: radii.pill, backgroundColor: '#E7F2DE', paddingHorizontal: 5, paddingVertical: 1.5 },
  pillText: { color: colors.forestDark, fontSize: 4.8, fontWeight: '900' },
  scroll: { flex: 1, minHeight: 0 },
  games: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 3 },
  gameTile: { width: 112, height: 88 },
});
