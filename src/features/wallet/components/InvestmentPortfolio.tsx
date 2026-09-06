import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Investment } from '@/core/domain/types';
import { buildInvestmentForecastByDays, buildPortfolioProfitForecast } from '@/core/economy/investmentPlan';
import { formatMoney } from '@/core/domain/money';
import { getInvestmentCompanion } from '@/registry/investmentCompanions';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function InvestmentPortfolio({ investments, currentDay }: { investments: Investment[]; currentDay: number }) {
  const [selectedId, setSelectedId] = useState('all');
  const selectedInvestment = useMemo(() => investments.find((investment) => investment.id === selectedId) ?? null, [investments, selectedId]);
  const selectedInvestments = useMemo(
    () => selectedId === 'all' ? investments.filter((investment) => investment.status === 'active') : selectedInvestment ? [selectedInvestment] : [],
    [investments, selectedId, selectedInvestment],
  );
  const points = useMemo(
    () => selectedId === 'all' ? buildPortfolioProfitForecast(selectedInvestments) : selectedInvestments[0] ? buildInvestmentForecastByDays(selectedInvestments[0]) : [],
    [selectedId, selectedInvestments],
  );
  const maxProfit = Math.max(1, ...points.map((point) => point.projectedProfitCents));
  const chartWidth = 250;
  const chartHeight = 66;
  const padX = 12;
  const padY = 9;
  const plotWidth = chartWidth - padX * 2;
  const plotHeight = chartHeight - padY * 2;
  const coords = points.map((point, index) => ({
    point,
    x: padX + (points.length <= 1 ? 0 : (index / (points.length - 1)) * plotWidth),
    y: padY + plotHeight - (point.projectedProfitCents / maxProfit) * plotHeight,
  }));
  const latest = [...points].reverse().find((point) => point.levelOrder <= currentDay) ?? points[0] ?? null;

  return (
    <View style={styles.root}>
      <View style={styles.chartPane}>
        <View style={styles.chartHead}>
          <View><Text style={styles.eyebrow}>GANANCIA</Text><Text style={styles.chartTitle}>{selectedId === 'all' ? 'Cartera' : getInvestmentCompanion(selectedInvestment?.companionKey ?? 'companion-1').label}</Text></View>
          <Text style={styles.liveValue}>{latest ? `+${formatMoney(latest.projectedProfitCents)}` : '+$0'}</Text>
        </View>
        {points.length === 0 ? <View style={styles.empty}><Text style={styles.emptyText}>Sin expediciones activas</Text></View> : (
          <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
            {coords.slice(0, -1).map((coordinate, index) => {
              const next = coords[index + 1]; if (!next) return null;
              const dx = next.x - coordinate.x; const dy = next.y - coordinate.y;
              const length = Math.sqrt(dx * dx + dy * dy); const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              return <View key={`line-${index}`} style={[styles.line, { width: length, left: (coordinate.x + next.x) / 2 - length / 2, top: (coordinate.y + next.y) / 2, transform: [{ rotate: `${angle}deg` }] }]} />;
            })}
            {coords.map((coordinate) => <View key={`p-${coordinate.point.levelOrder}`} style={[styles.point, { left: coordinate.x - 4, top: coordinate.y - 4 }]} />)}
          </View>
        )}
      </View>

      <View style={styles.listPane}>
        <View style={styles.listTop}>
          <Text style={styles.listTitle}>Expediciones</Text>
          <Pressable onPress={() => setSelectedId('all')} style={[styles.allPill, selectedId === 'all' && styles.allPillActive]}><Text style={styles.allText}>TODAS</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
          {investments.map((investment) => {
            const companion = getInvestmentCompanion(investment.companionKey);
            const active = selectedId === investment.id;
            return (
              <Pressable key={investment.id} onPress={() => setSelectedId(investment.id)} style={[styles.card, active && styles.cardActive]}>
                <Image source={companion.asset} style={styles.dino} resizeMode="contain" />
                <View style={styles.copy}>
                  <Text numberOfLines={1} style={styles.name}>{companion.label}</Text>
                  <Text style={styles.days}>D{investment.createdLevelOrder} → D{investment.targetLevelOrder}</Text>
                  <Text style={styles.money}>{formatMoney(investment.principalCents)} → {formatMoney(investment.payoutCents)}</Text>
                </View>
                <View style={[styles.status, investment.status === 'claimed' && styles.claimed]}><Text style={styles.statusText}>{investment.status === 'claimed' ? ACTIVE_THEME.copy.investmentArrived : ACTIVE_THEME.copy.investmentTravelling}</Text></View>
              </Pressable>
            );
          })}
          {investments.length === 0 ? <Text style={styles.sideEmpty}>Tu primera expedición aparecerá aquí.</Text> : null}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: 120, flexDirection: 'row', gap: 7 },
  chartPane: { width: 280, borderRadius: 16, backgroundColor: 'rgba(4,55,37,0.88)', borderWidth: 1.5, borderColor: 'rgba(139,202,126,0.75)', padding: 7, ...shadows.soft },
  chartHead: { height: 29, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#FFD85A', fontSize: 5.5, fontWeight: '900', letterSpacing: 0.5 },
  chartTitle: { color: colors.white, fontSize: 9, lineHeight: 10, fontWeight: '900' },
  liveValue: { color: '#FFD85A', fontSize: 10, fontWeight: '900' },
  chart: { position: 'relative', borderRadius: 12, backgroundColor: 'rgba(3,35,24,0.58)', overflow: 'hidden' },
  line: { position: 'absolute', height: 3, borderRadius: 2, backgroundColor: '#FFD54F' },
  point: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF9D58', borderWidth: 1.5, borderColor: colors.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#DDEDD8', fontSize: 7, fontWeight: '800' },
  listPane: { flex: 1, minWidth: 0 },
  listTop: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 6 },
  listTitle: { color: colors.white, fontSize: 9, fontWeight: '900', textShadowColor: '#183A2A', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
  allPill: { borderRadius: radii.pill, backgroundColor: 'rgba(255,253,244,0.88)', paddingHorizontal: 7, paddingVertical: 3 },
  allPillActive: { backgroundColor: '#FFD54F' },
  allText: { color: colors.forestDark, fontSize: 5.5, fontWeight: '900' },
  list: { gap: 6, alignItems: 'center', paddingRight: 4 },
  card: { width: 148, height: 82, borderRadius: 14, backgroundColor: 'rgba(255,253,244,0.94)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.92)', flexDirection: 'row', alignItems: 'center', padding: 6, gap: 4, position: 'relative', ...shadows.soft },
  cardActive: { borderColor: '#FFD54F' },
  dino: { width: 42, height: 42 },
  copy: { flex: 1, minWidth: 0 },
  name: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900' },
  days: { color: colors.inkMuted, fontSize: 5.5, fontWeight: '700' },
  money: { color: colors.orange, fontSize: 6.5, fontWeight: '900', marginTop: 1 },
  status: { position: 'absolute', right: 5, top: 5, borderRadius: radii.pill, backgroundColor: colors.orange, paddingHorizontal: 5, paddingVertical: 2 },
  claimed: { backgroundColor: colors.leaf },
  statusText: { color: colors.white, fontSize: 4.8, fontWeight: '900' },
  sideEmpty: { color: colors.white, fontSize: 7, fontWeight: '700', paddingVertical: 20 },
});
