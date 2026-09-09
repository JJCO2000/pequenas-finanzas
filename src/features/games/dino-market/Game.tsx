import React, { useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { DINO_MARKET_MISSIONS, type MarketCategory, type MarketItem } from '@/content/games/dinoMarket';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip, PrimaryGameButton } from '@/features/games/ui/GameChrome';

const CATEGORY: Record<MarketCategory, { label: string; icon: string }> = {
  drink: { label: 'Bebidas', icon: '◉' },
  food: { label: 'Comida', icon: '●' },
  school: { label: 'Escuela', icon: '✎' },
  fun: { label: 'Diversión', icon: '★' },
  safety: { label: 'Seguridad', icon: '+' },
};

export function DinoMarketGame({ session, onFinish }: GameComponentProps) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [cart, setCart] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const scan = useRef(new Animated.Value(0)).current;
  const mission = DINO_MARKET_MISSIONS[missionIndex];
  const haptics = session.modifiers.hapticsEnabled !== false;

  const selectedItems = useMemo(() => mission ? mission.items.filter((item) => cart.includes(item.id)) : [], [cart, mission]);
  const spend = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const remaining = Math.max(0, (mission?.budget ?? 0) - spend);
  const covered = new Set(selectedItems.map((item) => item.category));
  const missing = mission?.requiredCategories.filter((category) => !covered.has(category)) ?? [];

  const finish = (scores: number[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const score = Math.round(scores.reduce((sum, item) => sum + item, 0) / Math.max(1, scores.length));
    onFinish({ gameId: session.gameId, sessionId: session.sessionId, score, durationMs: Date.now() - startRef.current, completed: true, metrics: { missions: scores.length, mistakes, averageScore: score } });
  };

  if (!mission) return null;

  const toggle = (item: MarketItem) => {
    setFeedback(null);
    setCart((previous) => previous.includes(item.id) ? previous.filter((id) => id !== item.id) : [...previous, item.id]);
    if (haptics) void Haptics.selectionAsync();
  };

  const checkout = () => {
    const overBudget = spend > mission.maxSpend || spend > mission.budget;
    const valid = !overBudget && missing.length === 0;
    if (!valid) {
      setMistakes((value) => value + 1);
      const text = overBudget
        ? `La caja marca $${spend}. Tu límite para esta misión es $${mission.maxSpend}.`
        : `Tu lista aún necesita: ${missing.map((category) => CATEGORY[category].label).join(', ')}.`;
      setFeedback({ text, good: false });
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    const saved = mission.budget - spend;
    const efficiency = mission.maxSpend === mission.budget ? 100 : Math.min(100, 80 + saved * 5);
    const nextScores = [...roundScores, efficiency];
    setRoundScores(nextScores);
    setFeedback({ text: `¡Compra aprobada! Gastaste $${spend} y conservaste $${saved}.`, good: true });
    scan.setValue(0);
    Animated.timing(scan, { toValue: 1, duration: 620, useNativeDriver: true }).start();
    if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      if (missionIndex >= DINO_MARKET_MISSIONS.length - 1) finish(nextScores);
      else {
        setMissionIndex((value) => value + 1);
        setCart([]);
        setFeedback(null);
        scan.setValue(0);
      }
    }, 700);
  };

  return (
    <ImageBackground source={ACTIVE_THEME.world.market ?? ACTIVE_THEME.world.shop} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.missionCard}>
          <Text style={styles.kicker}>LISTA {missionIndex + 1}/{DINO_MARKET_MISSIONS.length}</Text>
          <Text style={styles.missionTitle}>{mission.instruction}</Text>
          <View style={styles.requirements}>
            {mission.requiredCategories.map((category) => (
              <View key={category} style={[styles.requirement, covered.has(category) && styles.requirementDone]}>
                <Text style={styles.requirementIcon}>{covered.has(category) ? '✓' : CATEGORY[category].icon}</Text>
                <Text style={styles.requirementText}>{CATEGORY[category].label}</Text>
              </View>
            ))}
          </View>
        </View>
        <HudChip label="PRESUPUESTO" value={`$${mission.budget}`} tone="gold" />
        <HudChip label="EN CARRITO" value={`$${spend}`} tone={spend > mission.maxSpend ? 'danger' : 'dark'} />
        <HudChip label="TE QUEDA" value={`$${remaining}`} tone="light" />
      </View>
      <GameProgress value={(missionIndex + (missing.length === 0 ? 0.8 : selectedItems.length / Math.max(1, mission.items.length) * 0.5)) / DINO_MARKET_MISSIONS.length} />

      <View style={styles.market}>
        <View style={styles.aisles}>
          <View style={styles.storeSign}><Text style={styles.storeSignText}>MERCADO DINO · ELIGE CON INTENCIÓN</Text></View>
          <View style={styles.tabs}><View style={[styles.tab, styles.tabActive]}><Text style={styles.tabTextActive}>Todos</Text></View><View style={styles.tab}><Text style={styles.tabText}>Bebidas</Text></View><View style={styles.tab}><Text style={styles.tabText}>Comida</Text></View><View style={styles.tab}><Text style={styles.tabText}>Escolar</Text></View></View>
          <View style={styles.shelves}>
            <View pointerEvents="none" style={[styles.shelfRail, styles.shelfRailTop]} />
            <View pointerEvents="none" style={[styles.shelfRail, styles.shelfRailBottom]} />
            {mission.items.map((item) => {
              const selected = cart.includes(item.id);
              const itemArt = getMarketArt(item.id);
              return (
                <Pressable key={item.id} onPress={() => toggle(item)} style={({ pressed }: { pressed: boolean }) => [styles.item, selected && styles.itemSelected, pressed && styles.pressed]}>
                  <View style={styles.itemIcon}>{itemArt ? <Image source={itemArt} resizeMode="contain" style={styles.itemImage} /> : <Text style={styles.itemIconText}>{CATEGORY[item.category].icon}</Text>}</View>
                  <Text numberOfLines={1} style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemCategory}>{CATEGORY[item.category].label}</Text>
                  <View style={styles.price}><Text style={styles.priceText}>${item.price}</Text></View>
                  {selected ? <View style={styles.inCart}><Text style={styles.inCartText}>✓ CARRITO</Text></View> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.cartPanel}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.checkoutScan,
              {
                opacity: scan.interpolate({ inputRange: [0, 0.06, 0.88, 1], outputRange: [0, 0.85, 0.7, 0] }),
                transform: [{ translateX: scan.interpolate({ inputRange: [0, 1], outputRange: [-35, 210] }) }],
              },
            ]}
          />
          <View style={styles.cartHead}><Text style={styles.cartIcon}>▰</Text><View><Text style={styles.cartEyebrow}>TU CARRITO</Text><Text style={styles.cartTitle}>{selectedItems.length} producto{selectedItems.length === 1 ? '' : 's'}</Text></View></View>
          <ScrollView style={styles.cartList} contentContainerStyle={styles.cartContent} showsVerticalScrollIndicator={false}>
            {selectedItems.map((item) => (
              <Pressable key={item.id} onPress={() => toggle(item)} style={styles.cartRow}>
                <Text style={styles.cartRowLabel}>{item.label}</Text><Text style={styles.cartRowPrice}>${item.price}</Text><Text style={styles.remove}>×</Text>
              </Pressable>
            ))}
            {selectedItems.length === 0 ? <View style={styles.emptyCart}><Image source={ACTIVE_THEME.characters.marketGuide} resizeMode="contain" style={styles.cartHero} /><Text style={styles.cartEmptyTitle}>Aún no has agregado productos.</Text><Text style={styles.cartEmpty}>Elige lo necesario para completar la misión.</Text></View> : null}
          </ScrollView>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>TOTAL</Text><Text style={[styles.totalValue, spend > mission.maxSpend && styles.totalDanger]}>${spend}</Text></View>
          <Text style={styles.limit}>Límite de misión: ${mission.maxSpend}</Text>
          <PrimaryGameButton label="PASAR POR CAJA →" onPress={checkout} disabled={selectedItems.length === 0} />
        </View>
      </View>
      <View style={styles.feedback}>{feedback ? <FeedbackPill text={feedback.text} good={feedback.good} /> : null}</View>
    </ImageBackground>
  );
}

function getMarketArt(id: string) {
  const art = ACTIVE_THEME.marketItems;
  if (!art) return undefined;
  const alias: Record<string, string> = { water2: 'water', water3: 'water', fruit: 'apple', sandwich: 'cereal', marker: 'pencil', eraser: 'pencil', soda: 'juice' };
  return art[id] ?? art[alias[id] ?? ''];
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 8, gap: 6 },
  top: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 9 },
  missionCard: { flex: 1, minWidth: 0, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 9, paddingVertical: 6, ...shadows.soft },
  kicker: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  missionTitle: { color: colors.white, fontSize: 12, lineHeight: 14, fontWeight: '900' },
  requirements: { flexDirection: 'row', gap: 5, marginTop: 4 },
  requirement: { borderRadius: radii.pill, backgroundColor: colors.glassForest, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 3 },
  requirementDone: { backgroundColor: colors.leaf },
  requirementIcon: { color: colors.gold, fontSize: 7, fontWeight: '900' },
  requirementText: { color: colors.white, fontSize: 7, fontWeight: '800' },
  market: { flex: 1, minHeight: 0, flexDirection: 'row', gap: 8 },
  aisles: { flex: 1, minWidth: 0, borderRadius: radii.lg, backgroundColor: 'rgba(255,253,243,0.90)', borderWidth: 2, borderColor: colors.white, padding: 6, ...shadows.card },
  storeSign: { position: 'absolute', left: 8, right: 8, top: 5, height: 17, borderRadius: 8, backgroundColor: 'rgba(23,78,50,0.92)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  storeSignText: { color: colors.gold, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.65 },
  tabs: { height: 26, flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 18, marginBottom: 5 },
  tab: { minWidth: 68, height: 25, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, borderWidth: 1, borderColor: colors.leafSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9 },
  tabActive: { backgroundColor: colors.gold, borderColor: colors.goldSoft },
  tabText: { color: colors.forestDark, fontSize: 8.5, fontWeight: '900' },
  tabTextActive: { color: colors.forestDark, fontSize: 8.5, fontWeight: '900' },
  shelves: { flex: 1, minHeight: 0, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'space-between', rowGap: 10, position: 'relative', paddingVertical: 2 },
  shelfRail: { position: 'absolute', left: 0, right: 0, height: 11, borderRadius: 5, backgroundColor: '#8B5A37', borderWidth: 2, borderColor: '#5E3925', zIndex: 0, ...shadows.soft },
  shelfRailTop: { top: '45%' },
  shelfRailBottom: { bottom: -2 },
  item: { width: '24%', height: '44%', minHeight: 78, borderRadius: radii.lg, backgroundColor: 'rgba(255,251,237,0.98)', borderWidth: 2, borderColor: '#E8D8B6', alignItems: 'center', justifyContent: 'center', padding: 6, position: 'relative', zIndex: 1, ...shadows.soft },
  itemSelected: { backgroundColor: colors.surfaceGreen, borderColor: colors.gold, transform: [{ translateY: -2 }] },
  itemImage: { width: 52, height: 34 },
  itemIcon: { width: 58, height: 46, borderRadius: 16, backgroundColor: '#EDF6EA', borderWidth: 1, borderColor: '#D7E7D0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemIconText: { color: colors.forestDark, fontSize: 15, fontWeight: '900' },
  itemLabel: { color: colors.forestDark, fontSize: 8.5, lineHeight: 10, fontWeight: '900', marginTop: 3 },
  itemCategory: { color: colors.inkMuted, fontSize: 7, fontWeight: '800' },
  price: { position: 'absolute', top: 6, right: 6, borderRadius: 8, backgroundColor: colors.orange, borderWidth: 1, borderColor: '#FFD6BE', paddingHorizontal: 7, paddingVertical: 3, transform: [{ rotate: '2deg' }] },
  priceText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  inCart: { position: 'absolute', left: 7, bottom: 7, borderRadius: radii.pill, backgroundColor: colors.forest, paddingHorizontal: 7, paddingVertical: 3 },
  inCartText: { color: colors.white, fontSize: 6, fontWeight: '900' },
  cartPanel: { width: '19%', minWidth: 165, maxWidth: 220, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, padding: 9, overflow: 'hidden', ...shadows.card },
  checkoutScan: { position: 'absolute', top: 0, bottom: 0, width: 22, backgroundColor: 'rgba(99,244,200,0.36)', borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(217,255,239,0.72)', zIndex: 8 },
  cartHead: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 9 },
  cartIcon: { color: colors.gold, fontSize: 22, fontWeight: '900' },
  cartEyebrow: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  cartTitle: { color: colors.white, fontSize: 14, fontWeight: '900' },
  cartList: { flex: 1, minHeight: 0 },
  cartContent: { gap: 6, paddingVertical: 7 },
  cartRow: { minHeight: 32, borderRadius: radii.md, backgroundColor: colors.glassCream, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, gap: 5 },
  cartRowLabel: { flex: 1, color: colors.forestDark, fontSize: 9, fontWeight: '900' },
  cartRowPrice: { color: colors.orange, fontSize: 8.5, fontWeight: '900' },
  remove: { color: colors.danger, fontSize: 13, fontWeight: '900' },
  emptyCart: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  cartHero: { width: 64, height: 58 },
  cartEmptyTitle: { color: colors.white, fontSize: 10.5, lineHeight: 13, fontWeight: '900', textAlign: 'center' },
  cartEmpty: { color: colors.cream, fontSize: 9, lineHeight: 12, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  totalRow: { height: 36, borderTopWidth: 1, borderTopColor: colors.glassWhite, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: colors.cream, fontSize: 9, fontWeight: '900' },
  totalValue: { color: colors.gold, fontSize: 13, fontWeight: '900' },
  totalDanger: { color: colors.danger },
  limit: { color: colors.cream, fontSize: 8, textAlign: 'right', marginBottom: 7 },
  feedback: { height: 24, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
});
