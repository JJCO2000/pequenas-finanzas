import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppData } from '@/features/session/AppDataProvider';
import { InvestmentPortfolio } from '@/features/wallet/components/InvestmentPortfolio';
import { calculateInvestmentPayout } from '@/core/economy/investmentPlan';
import { formatMoney, pesos } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';
import { useCampBack } from '@/features/shell/navigation/useCampBack';
import { WorldScene } from '@/features/shell/world';
import { ActionPill, CompactHeader, HudPill } from '@/features/shell/gameui';
import { colors, radii, shadows } from '@/core/theme/tokens';

const INVEST_AMOUNTS = [10, 20, 50] as const;
type InvestAmount = (typeof INVEST_AMOUNTS)[number];

export default function InvestmentsScreen() {
  const { investments, activeInvestments, currentDay, wallet, investmentOpportunity, invest, settings } = useAppData();
  const { goBack } = useCampBack();
  const [investOpen, setInvestOpen] = useState(false);
  const [amount, setAmount] = useState<InvestAmount>(20);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const activeProfit = activeInvestments.reduce((sum, item) => sum + item.profitCents, 0);
  const amountCents = pesos(amount);
  const payout = calculateInvestmentPayout(amountCents);
  const targetDay = investmentOpportunity?.targetLevelOrder ?? currentDay + 4;
  const canInvest = Boolean(wallet && wallet.availableCents >= amountCents && !working);
  const haptics = settings.haptics !== 'off';

  const doInvest = async () => {
    if (!canInvest) return;
    setWorking(true); setMessage(null);
    try {
      await invest(amountCents);
      setMessage({ text: `${formatMoney(amountCents)} salió de expedición. Regresa como ${formatMoney(payout)} en D${targetDay}.`, good: true });
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo crear la inversión.', good: false });
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally { setWorking(false); }
  };

  return (
    <WorldScene background={ACTIVE_THEME.world.investments ?? ACTIVE_THEME.world.finance} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Inversiones" subtitle="Tu dinero viaja 4 días y vuelve con +50%." eyebrow="CENTRO DE EXPEDICIONES" hero={ACTIVE_THEME.characters.secondary} onBack={goBack} />
        <View style={styles.stats}>
          <HudPill label="DISPONIBLE" value={formatMoney(wallet?.availableCents ?? 0)} icon="●" tone="gold" />
          <HudPill label="VIAJANDO" value={formatMoney(wallet?.investedCents ?? 0)} icon="↗" />
          <HudPill label="GANANCIA" value={`+${formatMoney(activeProfit)}`} icon="★" tone="dark" />
        </View>
      </View>

      <View style={styles.expeditionScene}>
        <View style={styles.journeyCard}>
          <View style={styles.step}><Text style={styles.stepNumber}>1</Text><Text style={styles.stepTitle}>ELIGES</Text><Text style={styles.stepCopy}>$10 · $20 · $50</Text></View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.step}><Text style={styles.stepNumber}>2</Text><Text style={styles.stepTitle}>VIAJA</Text><Text style={styles.stepCopy}>4 días de aventura</Text></View>
          <Text style={styles.arrow}>→</Text>
          <View style={[styles.step, styles.stepReward]}><Text style={styles.stepNumber}>3</Text><Text style={styles.stepTitle}>REGRESA</Text><Text style={styles.stepRewardText}>×1.5</Text></View>
        </View>

        <View style={styles.routeLine} />
        <View style={styles.today}><Text style={styles.daySmall}>SALE</Text><Text style={styles.dayBig}>D{currentDay}</Text></View>
        <Image source={ACTIVE_THEME.characters.secondary} style={styles.heroDino} resizeMode="contain" />
        <View style={styles.arrival}><Text style={styles.daySmall}>REGRESA</Text><Text style={styles.dayBig}>D{targetDay}</Text></View>
        <View style={styles.rule}><Text style={styles.ruleText}>+50%</Text><Text style={styles.ruleSub}>ganancia fijada</Text></View>
        <ActionPill label="NUEVA EXPEDICIÓN  →" onPress={() => { setMessage(null); setInvestOpen(true); }} style={styles.newAction} />
      </View>

      <View style={styles.portfolioHeader}>
        <Text style={styles.portfolioTitle}>MIS EXPEDICIONES</Text>
        <Text style={styles.portfolioCount}>{activeInvestments.length} activa{activeInvestments.length === 1 ? '' : 's'}</Text>
      </View>
      <View style={styles.portfolio}><InvestmentPortfolio investments={investments} currentDay={currentDay} /></View>

      <Modal transparent visible={investOpen} animationType="fade" onRequestClose={() => setInvestOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar ventana de inversión" style={styles.modalShade} onPress={() => setInvestOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalTop}>
              <Image source={ACTIVE_THEME.characters.secondary} style={styles.modalHero} resizeMode="contain" />
              <View style={styles.modalCopy}><Text style={styles.modalKicker}>D{currentDay} → D{targetDay}</Text><Text style={styles.modalTitle}>¿Cuánto enviamos?</Text><Text style={styles.modalSub}>Lo que elijas vuelve automáticamente con 50% extra.</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setInvestOpen(false)} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
            </View>
            <View style={styles.amounts}>
              {INVEST_AMOUNTS.map((candidate) => {
                const disabled = (wallet?.availableCents ?? 0) < pesos(candidate);
                const selected = amount === candidate;
                return <Pressable key={candidate} accessibilityRole="button" accessibilityLabel={`Invertir ${candidate} pesos`} accessibilityState={{ disabled, selected }} disabled={disabled} onPress={() => { setAmount(candidate); setMessage(null); }} style={[styles.amount, selected && styles.amountSelected, disabled && styles.disabled]}><Image source={ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency} style={styles.amountCoin} resizeMode="contain" /><Text style={styles.amountText}>${candidate}</Text><Text style={styles.amountReturn}>→ ${Math.round(candidate * 1.5)}</Text></Pressable>;
              })}
            </View>
            <View style={styles.preview}><Text style={styles.previewLabel}>TU EXPEDICIÓN</Text><Text style={styles.previewText}>{formatMoney(amountCents)}  →  {formatMoney(payout)}</Text><Text style={styles.previewSub}>ganas {formatMoney(payout - amountCents)} al llegar a D{targetDay}</Text></View>
            {message ? <View accessibilityLiveRegion="polite" style={[styles.message, message.good ? styles.messageGood : styles.messageBad]}><Text style={styles.messageText}>{message.text}</Text></View> : null}
            <ActionPill label={working ? 'ENVIANDO…' : `ENVIAR ${formatMoney(amountCents)}  →`} onPress={() => void doInvest()} disabled={!canInvest} tone={canInvest ? 'gold' : 'light'} style={styles.confirm} />
          </Pressable>
        </Pressable>
      </Modal>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, zIndex: 20 },
  stats: { flexDirection: 'row', gap: 5 },
  expeditionScene: { flex: 1, minHeight: 0, position: 'relative', alignItems: 'center', justifyContent: 'center', paddingBottom: 108 },
  journeyCard: { position: 'absolute', top: 12, width: '52%', minWidth: 430, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,253,244,0.92)', borderWidth: 1.5, borderColor: '#DDE8D4', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9, ...shadows.soft },
  step: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stepReward: { backgroundColor: '#FFF0A8', borderRadius: 12, paddingVertical: 4 },
  stepNumber: { width: 16, height: 16, borderRadius: 8, textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.forestDark, color: colors.white, fontSize: 6, fontWeight: '900' },
  stepTitle: { color: colors.forestDark, fontSize: 6.5, fontWeight: '900', marginTop: 2, letterSpacing: 0.6 },
  stepCopy: { color: colors.inkMuted, fontSize: 6, fontWeight: '700', marginTop: 1 },
  stepRewardText: { color: colors.orange, fontSize: 11, fontWeight: '900', marginTop: 1 },
  arrow: { color: colors.orange, fontSize: 17, fontWeight: '900', marginHorizontal: 3 },
  routeLine: { position: 'absolute', left: '22%', right: '22%', top: '55%', borderTopWidth: 3, borderStyle: 'dashed', borderColor: 'rgba(16,77,51,0.75)' },
  today: { position: 'absolute', left: '18%', top: '47%', width: 60, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,253,244,0.96)', borderWidth: 2, borderColor: '#DDE8D4', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  arrival: { position: 'absolute', right: '18%', top: '47%', width: 60, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,253,244,0.96)', borderWidth: 2, borderColor: '#FFD54F', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  daySmall: { color: colors.inkMuted, fontSize: 5.5, fontWeight: '900' },
  dayBig: { color: colors.forestDark, fontSize: 14, lineHeight: 16, fontWeight: '900' },
  heroDino: { width: 132, height: 96, marginTop: 56 },
  rule: { position: 'absolute', top: '37%', alignSelf: 'center', borderRadius: 15, backgroundColor: '#FFF0A8', borderWidth: 1.5, borderColor: '#FFD54F', paddingHorizontal: 12, paddingVertical: 5, alignItems: 'center', ...shadows.soft },
  ruleText: { color: colors.forestDark, fontSize: 12, fontWeight: '900' },
  ruleSub: { color: colors.inkMuted, fontSize: 5.5, fontWeight: '800' },
  newAction: { position: 'absolute', top: '72%', alignSelf: 'center', minWidth: 160 },
  portfolioHeader: { position: 'absolute', left: 18, bottom: 95, flexDirection: 'row', alignItems: 'center', gap: 7 },
  portfolioTitle: { color: colors.forestDark, fontSize: 8, fontWeight: '900', letterSpacing: 0.6 },
  portfolioCount: { color: colors.forestDark, fontSize: 6.5, fontWeight: '900', backgroundColor: '#FFF0A8', borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 3 },
  portfolio: { position: 'absolute', left: 10, right: 10, bottom: 8 },
  modalShade: { flex: 1, backgroundColor: 'rgba(4,24,16,0.44)', alignItems: 'center', justifyContent: 'center', padding: 12 },
  modalCard: { width: '46%', minWidth: 420, maxWidth: 560, borderRadius: 20, backgroundColor: '#FFFDF5', borderWidth: 1.5, borderColor: '#FFD54F', padding: 10, ...shadows.card },
  modalTop: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalHero: { width: 62, height: 54 },
  modalCopy: { flex: 1, minWidth: 0 },
  modalKicker: { color: colors.orange, fontSize: 5.5, fontWeight: '900' },
  modalTitle: { color: colors.forestDark, fontSize: 14, lineHeight: 16, fontWeight: '900' },
  modalSub: { color: colors.inkMuted, fontSize: 6.5, fontWeight: '700' },
  close: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.forestDark, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.white, fontSize: 17, lineHeight: 18, fontWeight: '900' },
  amounts: { flexDirection: 'row', gap: 6, marginTop: 7 },
  amount: { flex: 1, minHeight: 58, borderRadius: 15, backgroundColor: '#EFF7E8', borderWidth: 1.5, borderColor: '#D8E6D0', alignItems: 'center', justifyContent: 'center' },
  amountSelected: { backgroundColor: '#FFF0A8', borderColor: '#FFD54F' },
  amountCoin: { width: 25, height: 25 },
  amountText: { color: colors.forestDark, fontSize: 10, fontWeight: '900' },
  amountReturn: { color: colors.orange, fontSize: 6.5, fontWeight: '900', marginTop: 1 },
  preview: { marginTop: 7, minHeight: 44, borderRadius: 14, backgroundColor: '#EAF6E5', alignItems: 'center', justifyContent: 'center' },
  previewLabel: { color: colors.inkMuted, fontSize: 5.5, fontWeight: '900', letterSpacing: 0.8 },
  previewText: { color: colors.forestDark, fontSize: 12, fontWeight: '900' },
  previewSub: { color: colors.inkMuted, fontSize: 6, fontWeight: '700', marginTop: 1 },
  message: { borderRadius: radii.pill, minHeight: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginTop: 6 },
  messageGood: { backgroundColor: colors.leaf }, messageBad: { backgroundColor: colors.danger },
  messageText: { color: colors.white, fontSize: 6.5, fontWeight: '900' },
  confirm: { marginTop: 7, alignSelf: 'stretch' },
  disabled: { opacity: 0.34 },
});
