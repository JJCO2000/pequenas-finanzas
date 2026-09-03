import React from 'react';import{Image,StyleSheet,View}from'react-native';import type{ImageSourcePropType}from'react-native';import{ASSETS}from'@/registry/assets';import{colors}from'@/core/theme/tokens';
const ICONS:Record<string,ImageSourcePropType>={home:ASSETS.tabs.home,map:ASSETS.tabs.map,games:ASSETS.tabs.games,wallet:ASSETS.tabs.wallet,parents:ASSETS.tabs.parents};
export function DinoTabIcon({name,focused}:{name:keyof typeof ICONS;focused:boolean}){return <View style={[s.wrap,focused&&s.focus]}><Image source={ICONS[name]} style={s.img} resizeMode="contain"/></View>};
const s=StyleSheet.create({wrap:{width:34,height:34,borderRadius:17,alignItems:'center',justifyContent:'center'},focus:{backgroundColor:colors.surfaceMuted},img:{width:30,height:30}});
