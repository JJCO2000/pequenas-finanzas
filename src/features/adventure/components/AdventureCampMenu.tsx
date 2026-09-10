import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AdventureStageProgress } from './AdventureStageProgress';
import { ACTIVE_THEME } from '@/core/theme';
import { ActionPill, FloatingCard, HudPill, IconButton, SceneHotspot } from '@/features/shell/gameui';
import { useAppData } from '@/features/session/AppDataProvider';
import { StreakCard } from '@/features/streak/StreakCard';
import { getGamePresentation } from '@/registry/gamePresentation';
import { colors, radii, shadows } from '@/core/theme/tokens';

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
  const streakPending = Boolean(streak && !streak.completedToday);

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
            <View pointerEvents="none" style={styles.glowA} />
            <View pointerEvents="none" style={styles.glowB} />
            <View pointerEvents="none" style={styles.campDots}>
              <View style={[styles.dot, styles.dotGold]} />
              <View style={[styles.dot, styles.dotLeaf]} />
              <View style={[styles.dot, styles.dotOrange]} />
            </View>

            <View style={styles.top}>
              <View style={styles.identity}>
                <Text style={styles.eyebrow}>CAMPAMENTO · {profileName.toUpperCase()}</Text>
                <Text style={styles.title}>Elige tu siguiente paso</Text>
                <Text style={styles.subtitle}>{streakPending ? 'Primero: completa tu reto de hoy.' : 'Tu racha está lista. Explora cuando quieras.'}</Text>
              </View>
              <HudPill label="DÍA" value={currentDay} tone="gold" />
              <IconButton label="⚙" accessibilityLabel="Ajustes" onPress={() => onNavigate('/settings')} />
              <IconButton label="×" accessibilityLabel="Cerrar" onPress={onClose} />
            </View>

            <View style={styles.progressRow}>
              <View style={styles.progressLabelWrap}>
                <Text style={styles.progressLabel}>TU CAMINO</Text>
                <Text style={styles.progressDay}>Día {currentDay}</Text>
              </View>
              <View style={styles.progress}><AdventureStageProgress dayNumber={currentDay} compact /></View>
            </View>

            {streak ? (
              <View style={styles.streakSection}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionEyebrow}>{streak.completedToday ? 'HECHO POR HOY' : 'SIGUIENTE ACCIÓN'}</Text>
                  <Text style={styles.sectionHint}>{streak.completedToday ? 'Puedes seguir explorando.' : '1 reto · pocos minutos'}</Text>
                </View>
                <StreakCard snapshot={streak} challengeTitle={challengeTitle} onPress={openDailyChallenge} />
              </View>
            ) : null}

            <View style={styles.destinationHeader}>
              <Text style={styles.destinationTitle}>OTROS LUGARES</Text>
              <Text style={styles.destinationHint}>Toca una tarjeta para entrar.</Text>
            </View>
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

            <ActionPill label="SEGUIR EN EL MAPA →" onPress={onClose} tone="light" style={styles.continue} />
          </FloatingCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shade: { flex: 1, backgroundColor: 'rgba(4,24,16,0.34)', justifyContent: 'center', alignItems: 'center', padding: 10 },
  shell: { width: '84%', maxWidth: 740, minWidth: 570 },
  card: { paddingHorizontal: 11, paddingVertical: 9, gap: 6, overflow: 'hidden' },
  glowA: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,216,90,0.08)', left: -42, top: -74 },
  glowB: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(129,204,112,0.08)', right: 52, bottom: -82 },
  campDots: { position: 'absolute', right: 118, top: 17, flexDirection: 'row', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotGold: { backgroundColor: '#FFD85A' },
  dotLeaf: { backgroundColor: '#83C978' },
  dotOrange: { backgroundColor: '#F58A45' },
  top: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 6 },
  identity: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#FFD85A', fontSize: 5.5, fontWeight: '900', letterSpacing: 0.75 },
  title: { color: colors.white, fontSize: 14.5, lineHeight: 17, fontWeight: '900', marginTop: 1 },
  subtitle: { color: '#DDEED8', fontSize: 6.1, lineHeight: 7.5, fontWeight: '700', marginTop: 1 },
  progressRow: { minHeight: 25, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 3, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 4 },
  progressLabelWrap: { width: 65 },
  progressLabel: { color: '#BDD9B6', fontSize: 4.8, lineHeight: 5.8, fontWeight: '900', letterSpacing: 0.7 },
  progressDay: { color: colors.white, fontSize: 6.3, lineHeight: 7.5, fontWeight: '900' },
  progress: { flex: 1, minWidth: 0 },
  streakSection: { marginTop: 1, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.045)', padding: 5 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 4 },
  sectionEyebrow: { color: '#FFD85A', fontSize: 5.2, fontWeight: '900', letterSpacing: 0.8 },
  sectionHint: { color: '#D7E9D2', fontSize: 5.3, fontWeight: '800' },
  destinationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 1 },
  destinationTitle: { color: '#DDEED8', fontSize: 5.4, fontWeight: '900', letterSpacing: 0.75 },
  destinationHint: { color: '#AFCBAD', fontSize: 5.1, fontWeight: '700' },
  destinations: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 5, paddingHorizontal: 3, paddingVertical: 2 },
  continue: { alignSelf: 'center', minWidth: 150, minHeight: 31, marginTop: 1, ...shadows.soft },
});
