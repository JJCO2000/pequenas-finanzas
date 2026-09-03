import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Canvas, Circle, Fill, RoundedRect } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { circleIntersectsRect } from '@/core/game-runtime/systems/collision';
import { clamp } from '@/core/game-runtime/systems/movement';
import { deterministicSpawnX } from '@/core/game-runtime/systems/spawn';
import { colors, radii, spacing, typography } from '@/core/theme/tokens';
const R=18, BW=96, BH=26, SECONDS=30;
export function CoinCatcherGame({session,onFinish}:GameComponentProps){
 const {width}=useWindowDimensions(); const stageWidth=Math.min(width-spacing.lg*2,560); const stageHeight=Math.min(560,Math.round(stageWidth*1.2)); const basketY=stageHeight-56;
 const basketX=useSharedValue((stageWidth-BW)/2), coinX=useSharedValue(stageWidth/2), coinY=useSharedValue(-R*2), speed=useSharedValue(190), paused=useSharedValue(false);
 const pausedRef=useRef(false), finishedRef=useRef(false), startRef=useRef(Date.now()); const [score,setScore]=useState(0),[seconds,setSeconds]=useState(SECONDS),[finished,setFinished]=useState(false);
 const caught=()=>{setScore(v=>v+1);void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)};
 const frame=useFrameCallback(info=>{if(finished||paused.value)return; const dt=Math.min(info.timeSincePreviousFrame??16,32)/1000; coinY.value+=speed.value*dt; if(circleIntersectsRect(coinX.value,coinY.value,R,basketX.value,basketY,BW,BH)){coinY.value=-R*2;coinX.value=deterministicSpawnX(info.timestamp,24,Math.max(25,stageWidth-24));speed.value=Math.min(360,speed.value+4);scheduleOnRN(caught)}else if(coinY.value>stageHeight+R){coinY.value=-R*2;coinX.value=deterministicSpawnX(info.timestamp+97,24,Math.max(25,stageWidth-24));}},true);
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>{const p=state!=='active';pausedRef.current=p;paused.value=p;frame.setActive(!p&&!finishedRef.current)});return()=>sub.remove()},[frame,paused]);
 useEffect(()=>{const t=setInterval(()=>{if(pausedRef.current||finishedRef.current)return;setSeconds(v=>{if(v<=1){finishedRef.current=true;setFinished(true);frame.setActive(false);return 0}return v-1})},1000);return()=>clearInterval(t)},[frame]);
 useEffect(()=>{if(finished)onFinish({gameId:session.gameId,sessionId:session.sessionId,score,durationMs:Date.now()-startRef.current,completed:true,metrics:{coins:score}})},[finished,onFinish,score,session.gameId,session.sessionId]);
 const pan=useMemo(()=>Gesture.Pan().onBegin(e=>{basketX.value=clamp(e.x-BW/2,0,stageWidth-BW)}).onChange(e=>{basketX.value=clamp(e.x-BW/2,0,stageWidth-BW)}),[basketX,stageWidth]);
 return <View style={s.wrap}><View style={s.hud}><Text style={s.hudText}>Monedas: {score}</Text><Text style={s.hudText}>Tiempo: {seconds}s</Text></View><GestureDetector gesture={pan}><View style={{width:stageWidth,height:stageHeight,borderRadius:radii.lg,overflow:'hidden'}}><Canvas style={StyleSheet.absoluteFill}><Fill color={colors.sky}/><Circle cx={coinX} cy={coinY} r={R} color={colors.gold}/><RoundedRect x={basketX} y={basketY} width={BW} height={BH} r={12} color={colors.brown}/></Canvas><Text style={s.hint}>Arrastra para mover la canasta</Text></View></GestureDetector>{finished?<Text style={s.done}>¡Tiempo! Puntaje: {score}</Text>:null}</View>
}
const s=StyleSheet.create({wrap:{alignItems:'center',gap:spacing.sm},hud:{width:'100%',flexDirection:'row',justifyContent:'space-between'},hudText:{color:colors.forestDark,fontSize:typography.body,fontWeight:'900'},hint:{position:'absolute',left:0,right:0,top:12,textAlign:'center',color:colors.forestDark,fontWeight:'800'},done:{fontSize:typography.h2,color:colors.orange,fontWeight:'900'}});
