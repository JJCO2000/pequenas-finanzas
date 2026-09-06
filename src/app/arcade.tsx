import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { GAMES } from '@/registry/games';
import { getGamePresentation } from '@/registry/gamePresentation';
import { ACTIVE_THEME } from '@/core/theme';
import { useCampBack } from '@/features/shell/navigation/useCampBack';
import { WorldScene } from '@/features/shell/world';
import { CompactHeader, GameTile, HudPill } from '@/features/shell/gameui';
import { colors } from '@/core/theme/tokens';

const TILE_BG = ['#EAF6D8', '#DDF4E5', '#FFF0D9', '#E1F2F8', '#EFE5FF', '#FFE6D9', '#E8F5E3'];

export default function ArcadeScreen() {
  const { width } = useWindowDimensions();
  const { goBack } = useCampBack();
  const columns = width >= 700 ? 4 : width >= 520 ? 3 : 2;
  const gap = 8;
  const maxTile = 150;
  const available = Math.max(300, width - 44);
  const gridWidth = Math.min(available, columns * maxTile + gap * (columns - 1));
  const tileWidth = Math.floor((gridWidth - gap * (columns - 1)) / columns);
  const tileHeight = Math.min(118, Math.round(tileWidth * 0.78));

  return (
    <WorldScene background={ACTIVE_THEME.world.arcade ?? ACTIVE_THEME.world.activity} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Arcade" subtitle="7 juegos disponibles · toca una portada." eyebrow="JUEGO LIBRE" hero={ACTIVE_THEME.characters.primary} onBack={goBack} />
        <HudPill label="RETOS" value={`${GAMES.length}/7`} icon="★" tone="gold" />
      </View>

      <View style={styles.heading}>
        <Text style={styles.headingTitle}>Elige un reto</Text>
        <Text style={styles.headingSub}>Todos visibles. Sin carteles gigantes.</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, { width: gridWidth, gap }]}>
          {GAMES.map((game, index) => {
            const p = getGamePresentation(game.id);
            const thumb = ACTIVE_THEME.gameThumbnails?.[game.id] ?? p.hero;
            return (
              <GameTile
                key={game.id}
                art={thumb}
                artBackground={TILE_BG[index % TILE_BG.length]}
                title={p.title}
                badge={p.badge}
                meta={`D${game.minimumDay ?? 1}`}
                onPress={() => router.push({ pathname: '/game/[gameId]', params: { gameId: game.id, mode: 'arcade' } })}
                style={{ width: tileWidth, height: tileHeight }}
              />
            );
          })}
        </View>
      </ScrollView>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8, gap: 7 },
  topRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  heading: { alignSelf: 'center', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, backgroundColor: 'rgba(4,54,36,0.68)' },
  headingTitle: { color: colors.white, fontSize: 13, lineHeight: 15, fontWeight: '900' },
  headingSub: { color: '#DDEED7', fontSize: 6.5, lineHeight: 8, fontWeight: '700' },
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center' },
});
