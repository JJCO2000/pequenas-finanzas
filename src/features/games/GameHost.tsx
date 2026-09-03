import React from 'react';
import type { GameComponentProps } from '@/core/game-runtime';
import { CoinCatcherGame } from './coin-catcher/Game';
const COMPONENTS: Record<string, React.ComponentType<GameComponentProps>> = { 'coin-catcher-v1': CoinCatcherGame };
export function GameHost({componentId,...props}:GameComponentProps & {componentId:string}) { const Component=COMPONENTS[componentId]; if(!Component) throw new Error(`Game component no registrado: ${componentId}`); return <Component {...props}/>; }
