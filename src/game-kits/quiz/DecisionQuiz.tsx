import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LessonOption } from '@/content/curriculum/levels';
import { PFButton } from '@/features/shell/components/PFButton';
import { colors, radii, spacing, typography } from '@/core/theme/tokens';
export function DecisionQuiz({ situation, options, onComplete }: { situation:string; options:LessonOption[]; onComplete:(score:number)=>Promise<void>|void }) {
  const [selected,setSelected]=useState<string|null>(null); const [busy,setBusy]=useState(false);
  const check=async()=>{ if(!selected||busy)return; setBusy(true); try { const correct=options.find(o=>o.id===selected)?.correct===true; await onComplete(correct?100:0); } finally { setBusy(false); } };
  return <View style={s.card}><Text style={s.title}>Actividad</Text><Text style={s.situation}>{situation}</Text>{options.map(o=><Pressable key={o.id} onPress={()=>setSelected(o.id)} style={[s.option,selected===o.id&&s.active]}><Text style={[s.optionText,selected===o.id&&s.activeText]}>{o.label}</Text></Pressable>)}<PFButton label={busy?'Revisando…':'Comprobar respuesta'} disabled={!selected||busy} onPress={()=>void check()}/></View>;
}
const s=StyleSheet.create({card:{backgroundColor:colors.surfaceMuted,borderRadius:radii.lg,padding:spacing.lg,gap:spacing.md},title:{fontSize:typography.h1,fontWeight:'900',color:colors.forestDark},situation:{fontSize:typography.body,fontWeight:'700',lineHeight:24,color:colors.ink},option:{backgroundColor:colors.surface,borderRadius:radii.md,borderWidth:2,borderColor:colors.creamStrong,padding:spacing.md},active:{borderColor:colors.aqua},optionText:{fontSize:typography.body,color:colors.ink},activeText:{fontWeight:'800',color:colors.forestDark}});
