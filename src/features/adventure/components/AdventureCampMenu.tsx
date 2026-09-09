import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AdventureStageProgress } from './AdventureStageProgress';
import { ACTIVE_THEME } from '@/core/theme';
import { ActionPill, FloatingCard, HudPill, IconButton, SceneHotspot } from '@/features/shell/gameui';
import { useAppData } from '@/features/session/AppDataProvider';
import { StreakCard } from '@/features/streak/StreakCard';
import { getGamePresentation } from '@/registry/gamePresentation';
import { colors } from '@/core/theme/tokens';

export type CampRoute = '/wallet' | '/investments' | '/progress' | '/collection' | '/arcade' | '/parents' | '/settings';

const MENU_ITEMS: Array<{ label: string; subtitle: string; route: CampRoute; art: 'money' | 'invest' | 'arcade' | 'progress' | 'collection' | 'adults'; tone: string }> = [
  { label: 'Mi dinero', subtitle: 'Ahorro', route: '/wallet', art: 'money', tone: '#FFF0AF' },
  { label: 'Inversiones', subtitle: 'Viajes', route: '/investments', art: 'invest', tone: '#FFE1C8' },
  { label: 'Arcade', subtitle: '7 retos', route: '/arcade', art: 'arcade', tone: '#E8F4D8' },
  { label: 'Progreso', subtitle: 'Camino', route: '/progress', art: 'progress', tone: '#DDF3F7' },
  { label: 'Colección', subtitle: 'Museo', route: '/collection', art: 'collection', tone: '#EFE5FF' },
  { label: 'Adultos', subtitle: 'Resumen', route: '/parents', art: 'adults', tone: '#FFE6DF' },
];

function moduleArt(key: (typeof MENU_ITEMS)[number]['art']) {
  switch (key) {
    case 'money': return ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency;
    case 'invest': return ACTIVE_THEME.characters.secondary;
    case 'arcade': return ACTIVE_THEME.gameThumbnails?.['coin-catcher'] ?? ACTIVE_THEME.characters.primary;
    case 'progress': return ACTIVE_THEME.characters.quaternary;
    case 'collection': return ACTIVE_THEME.shop.featuredItem;
    case 'adults': return ACTIVE_THEME.characters.tertiary;
  }
}

export function AdventureCampMenu({ visible, profileName, currentDay, onClose, onNavigate }: {
  visible: boolean; profileName: string; currentDay: number; onClose: () => void; onNavigate: (route: CampRoute) => void;
}) {
  const { streak } = useAppData();
  const challengeTitle = streak ? getGamePresentation(streak.challengeGameId).title : '';

  const openDailyChallenge = () => {
    if (!streak) return;
    onClose();
    router.push({ pathname: '/game/[gameId]', params: { gameId: streak.challengeGameId, mode: 'arcade' } });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.shade} onPress={onClose}>
        <Pressable style={styles.shell} onPress={(event) => event.stopPropagation()}>
          <FloatingCard tone="dark" style={styles.card}>
            <View style={styles.top}>
              <View style={styles.identity}>
                <Text style={styles.eyebrow}>CAMPAMENTO · {profileName.toUpperCase()}</Text>
                <Text style={styles.title}>¿A dónde vas?</Text>
              </View>
              <HudPill label="DÍA" value={currentDay} tone="gold" />
              <IconButton label="⚙" accessibilityLabel="Ajustes" onPress={() => onNavigate('/settings')} />
              <IconButton label="×" accessibilityLabel="Cerrar" onPress={onClose} />
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>ETAPA</Text>
              <View style={styles.progress}><AdventureStageProgress dayNumber={currentDay} compact /></View>
            </View>

            {streak ? (
              <View style={styles.streakRow}>
                <StreakCard snapshot={streak} challengeTitle={challengeTitle} onPress={openDailyChallenge} />
              </View>
            ) : null}

            <View style={styles.destinations}>
              {MENU_ITEMS.map((item) => (
                <SceneHotspot
                  key={item.route}
                  art={moduleArt(item.art)}
                  artBackground={item.tone}
                  label={item.label}
                  sublabel={item.subtitle}
                  onPress={() => onNavigate(item.route)}
                />
              ))}
            </View>

            <ActionPill label="VOLVER AL MAPA" onPress={onClose} tone="gold" style={styles.continue} />
          </FloatingCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shade: { flex: 1, backgroundColor: 'rgba(4,24,16,0.24)', justifyContent: 'center', alignItems: 'center', padding: 10 },
  shell: { width: '82%', maxWidth: 720, minWidth: 560 },
  card: { padding: 9, gap: 6 },
  top: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 6 },
  identity: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#FFD85A', fontSize: 5.5, fontWeight: '900', letterSpacing: 0.6 },
  title: { color: colors.white, fontSize: 14, lineHeight: 16, fontWeight: '900' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 4 },
  progressLabel: { color: '#DDEED8', fontSize: 5.8, fontWeight: '900' },
  progress: { flex: 1, minWidth: 0 },
  streakRow: { paddingHorizontal: 3 },
  destinations: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 5, paddingHorizontal: 3, paddingVertical: 2 },
  continue: { alignSelf: 'center', minWidth: 130 },
});
