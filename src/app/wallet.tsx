import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAppData } from '@/features/session/AppDataProvider';
import { formatMoney, pesos } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';
import { useCampBack } from '@/features/shell/navigation/useCampBack';
import { WorldScene } from '@/features/shell/world';
import { ActionPill, CompactHeader, FloatingCard, HudPill, SceneHotspot } from '@/features/shell/gameui';
import { colors, radii } from '@/core/theme/tokens';

const INVEST_AMOUNTS = [10, 20, 50] as const;
type WalletMode = 'save' | 'invest' | 'history';
type Message = { text: string; good: boolean } | null;

export default function WalletScreen() {
  const { wallet, currentDay, activeInvestments, transactions, save, unsave, invest } = useAppData();
  const [mode, setMode] = useState<WalletMode>('save');
  const [message, setMessage] = useState<Message>(null);
  const { goBack } = useCampBack();

  const doAction = async (action: () => Promise<void>, success: string) => {
    try { await action(); setMessage({ text: success, good: true }); }
    catch (error) { setMessage({ text: error instanceof Error ? error.message : 'No se pudo completar la acción.', good: false }); }
  };

  return (
    <WorldScene background={ACTIVE_THEME.world.finance} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Mi dinero" subtitle="Ahorra, invierte o revisa movimientos." eyebrow="TESORERÍA" hero={ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency} onBack={goBack} />
        <HudPill label="DÍA" value={currentDay} icon="★" tone="gold" />
      </View>

      <View style={styles.objects}>
        <SceneHotspot art={ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency} artBackground="#FFF0AF" label="Disponible" sublabel={formatMoney(wallet?.availableCents ?? 0)} onPress={() => setMode('history')} selected={mode === 'history'} />
        <SceneHotspot art={ACTIVE_THEME.decor.savings} artBackground="#E4F3D8" label="Ahorro" sublabel={formatMoney(wallet?.savingsCents ?? 0)} onPress={() => setMode('save')} selected={mode === 'save'} />
        <SceneHotspot art={ACTIVE_THEME.characters.secondary} artBackground="#FFE0C7" label="Inversión" sublabel={formatMoney(wallet?.investedCents ?? 0)} onPress={() => setMode('invest')} selected={mode === 'invest'} />
        <SceneHotspot art={ACTIVE_THEME.shop.featuredItem} artBackground="#EEE5FF" label="Tienda" sublabel="Mejoras" onPress={() => router.push('/shop' as any)} />
      </View>

      <FloatingCard style={styles.drawer}>
        <View style={styles.tabs}>
          <Tab label="AHORRO" active={mode === 'save'} onPress={() => { setMode('save'); setMessage(null); }} />
          <Tab label="INVERTIR" active={mode === 'invest'} onPress={() => { setMode('invest'); setMessage(null); }} />
          <Tab label="MOVIMIENTOS" active={mode === 'history'} onPress={() => { setMode('history'); setMessage(null); }} />
        </View>

        {mode === 'save' ? (
          <View style={styles.drawerBody}>
            <Image source={ACTIVE_THEME.decor.savings} style={styles.drawerArt} resizeMode="contain" />
            <View style={styles.drawerCopy}>
              <Text style={styles.kicker}>NIDO DE AHORRO</Text>
              <Text style={styles.title}>Guarda $10 o retíralos cuando los necesites</Text>
              <Text numberOfLines={1} style={styles.copy}>El dinero solo cambia de lugar: disponible ↔ ahorro.</Text>
            </View>
            <View style={styles.actions}>
              <ActionPill label="AHORRAR $10" onPress={() => void doAction(() => save(pesos(10)), 'Guardaste $10.')} tone="gold" />
              <ActionPill label="RETIRAR $10" onPress={() => void doAction(() => unsave(pesos(10)), 'Retiraste $10.')} tone="light" />
            </View>
          </View>
        ) : null}

        {mode === 'invest' ? (
          <View style={styles.drawerBody}>
            <Image source={ACTIVE_THEME.characters.secondary} style={styles.drawerArt} resizeMode="contain" />
            <View style={styles.drawerCopy}>
              <Text style={styles.kicker}>EXPEDICIÓN · D{currentDay + 4}</Text>
              <Text style={styles.title}>Elige cuánto mandar de viaje</Text>
              <Text numberOfLines={1} style={styles.copy}>{activeInvestments.length} activas · regla N+4 / +50%.</Text>
            </View>
            <View style={styles.actions}>
              {INVEST_AMOUNTS.map((amount) => <ActionPill key={amount} label={`$${amount}`} onPress={() => void doAction(() => invest(pesos(amount)), `Inversión de $${amount} enviada.`)} tone="gold" />)}
              <ActionPill label="VER TODAS" onPress={() => router.push('/investments' as any)} tone="dark" />
            </View>
          </View>
        ) : null}

        {mode === 'history' ? (
          <View style={styles.history}>
            {transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.historyRow}>
                <Image source={ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency} style={styles.coinTiny} resizeMode="contain" />
                <Text numberOfLines={1} style={styles.historySource}>{transaction.source}</Text>
                <Text style={styles.historyAmount}>{formatMoney(transaction.amountCents)}</Text>
              </View>
            ))}
            {transactions.length === 0 ? <Text style={styles.empty}>Aún no hay movimientos.</Text> : null}
          </View>
        ) : null}
      </FloatingCard>

      {message ? <View style={[styles.toast, message.good ? styles.toastGood : styles.toastBad]}><Text style={styles.toastText}>{message.text}</Text></View> : null}
    </WorldScene>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  objects: { flex: 1, minHeight: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, paddingBottom: 106 },
  drawer: { position: 'absolute', left: 12, right: 12, bottom: 10, minHeight: 96, padding: 7 },
  tabs: { height: 26, flexDirection: 'row', gap: 5 },
  tab: { flex: 1, borderRadius: 13, backgroundColor: '#EAF2E4', alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.gold },
  tabText: { color: colors.forestDark, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.4 },
  tabTextActive: { color: '#093F2D' },
  drawerBody: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 5 },
  drawerArt: { width: 58, height: 52 },
  drawerCopy: { flex: 1, minWidth: 0 },
  kicker: { color: colors.orange, fontSize: 5.5, fontWeight: '900', letterSpacing: 0.5 },
  title: { color: colors.forestDark, fontSize: 10.5, lineHeight: 12, fontWeight: '900', marginTop: 1 },
  copy: { color: colors.inkMuted, fontSize: 6, lineHeight: 7.5, fontWeight: '700', marginTop: 1 },
  actions: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  history: { minHeight: 58, flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignContent: 'center', paddingTop: 5 },
  historyRow: { width: '32%', minHeight: 25, borderRadius: 13, backgroundColor: '#EEF6E8', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  coinTiny: { width: 18, height: 18 },
  historySource: { flex: 1, color: colors.ink, fontSize: 6.5, fontWeight: '800' },
  historyAmount: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900' },
  empty: { color: colors.inkMuted, fontSize: 7, fontWeight: '700' },
  toast: { position: 'absolute', top: 52, alignSelf: 'center', minWidth: 170, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 5, zIndex: 30 },
  toastGood: { backgroundColor: '#72AD54' }, toastBad: { backgroundColor: colors.danger },
  toastText: { color: colors.white, fontSize: 7, fontWeight: '900', textAlign: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
});
