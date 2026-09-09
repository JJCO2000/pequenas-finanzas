import React, { useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { DINO_MARKET_MISSIONS, type MarketCategory, type MarketItem } from '@/content/games/dinoMarket';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip, PrimaryGameButton } from '@/features/games/ui/GameChrome';

const CATEGORY: Record<MarketCategory, { label: string; singular: string; icon: string }> = {
  drink: { label: 'Bebidas', singular: 'Bebida', icon: '🥤' },
  food: { label: 'Comida', singular: 'Comida', icon: '🍎' },
  school: { label: 'Escuela', singular: 'Escolar', icon: '✏️' },
  fun: { label: 'Diversión', singular: 'Diversión', icon: '⭐' },
  safety: { label: 'Seguridad', singular: 'Seguridad', icon: '🛡️' },
};

const FALLBACK_GLYPHS: Record<string, string> = {
  pizza: '🍕', toy: '🧸', sandwich: '🥪', stickers: '🌟', figure: '🦕',
  bandage: '🩹', flashlight: '🔦', candy2: '🍬', eraser: '✏️', soda: '🥤',
};

type MarketFilter = 'all' | MarketCategory;

export function DinoMarketGame({ session, onFinish }: GameComponentProps) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [cart, setCart] = useState<string[]>([]);
  const [filter, setFilter] = useState<MarketFilter>('all');
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const scan = useRef(new Animated.Value(0)).current;
  const mission = DINO_MARKET_MISSIONS[missionIndex];
  const haptics = session.modifiers.hapticsEnabled !== false;

  const selectedItems = useMemo(() => mission ? mission.items.filter((item) => cart.includes(item.id)) : [], [cart, mission]);
  const displayedItems = useMemo(() => mission ? mission.items.filter((item) => filter === 'all' || item.category === filter) : [], [filter, mission]);
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

  const changeFilter = (next: MarketFilter) => {
    setFilter(next);
    if (haptics) void Haptics.selectionAsync();
  };

  const checkout = () => {
    const overBudget = spend > mission.maxSpend || spend > mission.budget;
    const valid = !overBudget && missing.length === 0;
    if (!valid) {
      setMistakes((value) => value + 1);
      const text = overBudget
        ? `La caja marca $${spend}. Tu límite para esta misión es $${mission.maxSpend}.`
        : `Todavía falta: ${missing.map((category) => CATEGORY[category].singular).join(', ')}.`;
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
        setFilter('all');
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
          <Text numberOfLines={1} style={styles.missionTitle}>{mission.instruction}</Text>
          <View style={styles.requirementsRow}>
            <Text style={styles.mustBuyLabel}>DEBES LLEVAR:</Text>
            <View style={styles.requirements}>
              {mission.requiredCategories.map((category) => {
                const done = covered.has(category);
                return (
                  <View key={category} style={[styles.requirement, done && styles.requirementDone]}>
                    <Text style={styles.requirementIcon}>{done ? '✓' : CATEGORY[category].icon}</Text>
                    <Text style={styles.requirementText}>{CATEGORY[category].singular}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        <HudChip label="PRESUPUESTO" value={`$${mission.budget}`} tone="gold" />
        <HudChip label="EN CARRITO" value={`$${spend}`} tone={spend > mission.maxSpend ? 'danger' : 'dark'} />
        <HudChip label="TE QUEDA" value={`$${remaining}`} tone="light" />
      </View>
      <GameProgress value={(missionIndex + (missing.length === 0 ? 0.8 : selectedItems.length / Math.max(1, mission.items.length) * 0.5)) / DINO_MARKET_MISSIONS.length} />

      <View style={styles.market}>
        <View style={styles.aisles}>
          <View style={styles.storeSign}><Text style={styles.storeSignText}>MERCADO DINO · CUMPLE TU LISTA SIN PASARTE DEL LÍMITE</Text></View>
          <View style={styles.tabs}>
            <Pressable onPress={() => changeFilter('all')} style={[styles.tab, filter === 'all' && styles.tabActive]}><Text style={filter === 'all' ? styles.tabTextActive : styles.tabText}>Todos</Text></Pressable>
            {mission.requiredCategories.map((category) => (
              <Pressable key={category} onPress={() => changeFilter(category)} style={[styles.tab, filter === category && styles.tabActive]}><Text style={filter === category ? styles.tabTextActive : styles.tabText}>{CATEGORY[category].label}</Text></Pressable>
            ))}
          </View>
          <View style={styles.shelves}>
            <View pointerEvents="none" style={[styles.shelfRail, styles.shelfRailTop]} />
            <View pointerEvents="none" style={[styles.shelfRail, styles.shelfRailBottom]} />
            {displayedItems.map((item) => {
              const selected = cart.includes(item.id);
              const itemArt = getMarketArt(item.id);
              const required = mission.requiredCategories.includes(item.category);
              return (
                <Pressable key={item.id} onPress={() => toggle(item)} style={({ pressed }: { pressed: boolean }) => [styles.item, required && styles.itemRelevant, selected && styles.itemSelected, pressed && styles.pressed]}>
                  <View style={styles.itemIcon}>
                    {itemArt ? <Image source={itemArt} resizeMode="contain" style={styles.itemImage} /> : <Text style={styles.itemEmoji}>{getMarketFallbackGlyph(item)}</Text>}
                  </View>
                  <Text numberOfLines={1} style={styles.itemLabel}>{item.label}</Text>
                  <Text numberOfLines={1} style={styles.itemCategory}>{CATEGORY[item.category].label}{required ? ' · EN TU LISTA' : ' · OPCIONAL'}</Text>
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
          <View style={styles.cartChecklist}>
            {mission.requiredCategories.map((category) => <Text key={category} style={[styles.cartCheck, covered.has(category) && styles.cartCheckDone]}>{covered.has(category) ? '✓' : '○'} {CATEGORY[category].singular}</Text>)}
          </View>
          <ScrollView style={styles.cartList} contentContainerStyle={styles.cartContent} showsVerticalScrollIndicator={false}>
            {selectedItems.map((item) => (
              <Pressable key={item.id} onPress={() => toggle(item)} style={styles.cartRow}>
                <Text style={styles.cartRowLabel}>{item.label}</Text><Text style={styles.cartRowPrice}>${item.price}</Text><Text style={styles.remove}>×</Text>
              </Pressable>
            ))}
            {selectedItems.length === 0 ? <View style={styles.emptyCart}><Image source={ACTIVE_THEME.characters.marketGuide} resizeMode="contain" style={styles.cartHero} /><Text style={styles.cartEmptyTitle}>Tu lista está arriba.</Text><Text style={styles.cartEmpty}>Elige un producto de cada categoría requerida.</Text></View> : null}
          </ScrollView>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>TOTAL</Text><Text style={[styles.totalValue, spend > mission.maxSpend && styles.totalDanger]}>${spend}</Text></View>
          <Text style={styles.limit}>Límite de misión: ${mission.maxSpend}</Text>
          <PrimaryGameButton label={missing.length === 0 ? 'PASAR POR CAJA →' : `FALTAN ${missing.length} CATEGORÍA${missing.length === 1 ? '' : 'S'}`} onPress={checkout} disabled={selectedItems.length === 0} />
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

function getMarketFallbackGlyph(item: MarketItem) {
  return FALLBACK_GLYPHS[item.id] ?? CATEGORY[item.category].icon;
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 8, gap: 6 },
  top: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 100, paddingRight: 48 },
  missionCard: { flex: 1, minWidth: 0, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 9, paddingVertical: 5, ...shadows.soft },
  kicker: { color: colors.gold, fontSize: 7, fontWeight: '900', letterSpacing: 0.9 },
  missionTitle: { color: colors.white, fontSize: 10.5, lineHeight: 12, fontWeight: '900' },
  requirementsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  mustBuyLabel: { color: colors.gold, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.7 },
  requirements: { flexDirection: 'row', gap: 4, flex: 1 },
  requirement: { borderRadius: radii.pill, backgroundColor: colors.glassForest, paddingHorizontal: 7, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  requirementDone: { backgroundColor: colors.leaf, borderColor: colors.goldSoft },
  requirementIcon: { color: colors.gold, fontSize: 8, fontWeight: '900' },
  requirementText: { color: colors.white, fontSize: 7, fontWeight: '900' },
  market: { flex: 1, minHeight: 0, flexDirection: 'row', gap: 8 },
  aisles: { flex: 1, minWidth: 0, borderRadius: radii.lg, backgroundColor: 'rgba(255,253,243,0.90)', borderWidth: 2, borderColor: colors.white, padding: 6, overflow: 'hidden', ...shadows.card },
  storeSign: { position: 'absolute', left: 8, right: 8, top: 5, height: 17, borderRadius: 8, backgroundColor: 'rgba(23,78,50,0.92)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  storeSignText: { color: colors.gold, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.55 },
  tabs: { height: 25, flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 18, marginBottom: 4 },
  tab: { minWidth: 62, height: 24, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, borderWidth: 1, borderColor: colors.leafSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  tabActive: { backgroundColor: colors.gold, borderColor: colors.goldSoft },
  tabText: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900' },
  tabTextActive: { color: colors.forestDark, fontSize: 8, fontWeight: '900' },
  shelves: { flex: 1, minHeight: 0, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'space-between', columnGap: 7, rowGap: 7, position: 'relative', paddingVertical: 2 },
  shelfRail: { position: 'absolute', left: 0, right: 0, height: 10, borderRadius: 5, backgroundColor: '#8B5A37', borderWidth: 2, borderColor: '#5E3925', zIndex: 0, ...shadows.soft },
  shelfRailTop: { top: '47%' },
  shelfRailBottom: { bottom: -2 },
  item: { width: '32%', height: '46%', minHeight: 70, borderRadius: radii.lg, backgroundColor: 'rgba(255,251,237,0.98)', borderWidth: 2, borderColor: '#E8D8B6', alignItems: 'center', justifyContent: 'center', padding: 5, position: 'relative', zIndex: 1, ...shadows.soft },
  itemRelevant: { borderColor: '#B9DDAE' },
  itemSelected: { backgroundColor: colors.surfaceGreen, borderColor: colors.gold, transform: [{ translateY: -2 }] },
  itemImage: { width: 46, height: 31 },
  itemIcon: { width: 52, height: 40, borderRadius: 14, backgroundColor: '#EDF6EA', borderWidth: 1, borderColor: '#D7E7D0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemEmoji: { fontSize: 23, lineHeight: 27 },
  itemLabel: { color: colors.forestDark, fontSize: 8.2, lineHeight: 9.5, fontWeight: '900', marginTop: 2 },
  itemCategory: { color: colors.inkMuted, fontSize: 5.7, lineHeight: 7, fontWeight: '900', textAlign: 'center', maxWidth: '94%' },
  price: { position: 'absolute', top: 5, right: 5, borderRadius: 8, backgroundColor: colors.orange, borderWidth: 1, borderColor: '#FFD6BE', paddingHorizontal: 6, paddingVertical: 2 },
  priceText: { color: colors.white, fontSize: 8.5, fontWeight: '900' },
  inCart: { position: 'absolute', left: 6, bottom: 5, borderRadius: radii.pill, backgroundColor: colors.forest, paddingHorizontal: 6, paddingVertical: 2 },
  inCartText: { color: colors.white, fontSize: 5.8, fontWeight: '900' },
  cartPanel: { width: '20%', minWidth: 172, maxWidth: 224, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, padding: 9, overflow: 'hidden', ...shadows.card },
  checkoutScan: { position: 'absolute', top: 0, bottom: 0, width: 22, backgroundColor: 'rgba(99,244,200,0.36)', borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(217,255,239,0.72)', zIndex: 8 },
  cartHead: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 9 },
  cartIcon: { color: colors.gold, fontSize: 20, fontWeight: '900' },
  cartEyebrow: { color: colors.gold, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  cartTitle: { color: colors.white, fontSize: 12.5, fontWeight: '900' },
  cartChecklist: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: colors.glassWhite },
  cartCheck: { color: colors.cream, fontSize: 6.5, fontWeight: '900' },
  cartCheckDone: { color: '#9BE18A' },
  cartList: { flex: 1, minHeight: 0 },
  cartContent: { gap: 5, paddingVertical: 5 },
  cartRow: { minHeight: 28, borderRadius: radii.md, backgroundColor: colors.glassCream, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 5 },
  cartRowLabel: { flex: 1, color: colors.forestDark, fontSize: 8.2, fontWeight: '900' },
  cartRowPrice: { color: colors.orange, fontSize: 8.2, fontWeight: '900' },
  remove: { color: colors.danger, fontSize: 13, fontWeight: '900' },
  emptyCart: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 5 },
  cartHero: { width: 48, height: 42 },
  cartEmptyTitle: { color: colors.white, fontSize: 9, lineHeight: 10.5, fontWeight: '900', textAlign: 'center' },
  cartEmpty: { color: colors.cream, fontSize: 7.2, lineHeight: 9, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  totalRow: { height: 30, borderTopWidth: 1, borderTopColor: colors.glassWhite, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: colors.cream, fontSize: 8.5, fontWeight: '900' },
  totalValue: { color: colors.gold, fontSize: 13, fontWeight: '900' },
  totalDanger: { color: colors.danger },
  limit: { color: colors.cream, fontSize: 7.2, textAlign: 'right', marginBottom: 4 },
  feedback: { height: 22, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
});
