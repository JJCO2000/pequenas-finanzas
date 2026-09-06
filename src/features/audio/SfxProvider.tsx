import React, { createContext, useCallback, useEffect, useMemo, useContext } from 'react';
import { useAudioPlayer, type AudioPlayer } from 'expo-audio';
import type { AudioCue } from '@/core/game-runtime/systems/audio';
import { useAppData } from '@/features/session/AppDataProvider';

const TAP_SOURCE = require('../../../assets/audio/sfx/tap.wav');

type SfxContextValue = {
  enabled: boolean;
  play: (cue?: AudioCue) => void;
};

type CueConfig = {
  player: AudioPlayer;
  rate: number;
  volume: number;
};

const SfxContext = createContext<SfxContextValue>({ enabled: false, play: () => undefined });

export function SfxProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAppData();
  const tapPlayer = useAudioPlayer(TAP_SOURCE);
  const coinPlayer = useAudioPlayer(TAP_SOURCE);
  const successPlayer = useAudioPlayer(TAP_SOURCE);
  const errorPlayer = useAudioPlayer(TAP_SOURCE);
  const celebratePlayer = useAudioPlayer(TAP_SOURCE);
  const enabled = settings.sound !== 'off';

  const cues = useMemo<Record<AudioCue, CueConfig>>(() => ({
    tap: { player: tapPlayer, rate: 1, volume: 0.32 },
    coin: { player: coinPlayer, rate: 1.3, volume: 0.38 },
    success: { player: successPlayer, rate: 1.16, volume: 0.4 },
    error: { player: errorPlayer, rate: 0.72, volume: 0.3 },
    celebrate: { player: celebratePlayer, rate: 1.48, volume: 0.42 },
  }), [celebratePlayer, coinPlayer, errorPlayer, successPlayer, tapPlayer]);

  useEffect(() => {
    Object.values(cues).forEach(({ player, rate, volume }) => {
      player.playbackRate = rate;
      player.volume = volume;
    });
  }, [cues]);

  const play = useCallback((cue: AudioCue = 'tap') => {
    if (!enabled) return;
    const config = cues[cue];
    config.player.playbackRate = config.rate;
    config.player.volume = config.volume;
    void config.player.seekTo(0)
      .then(() => config.player.play())
      .catch(() => undefined);
  }, [cues, enabled]);

  const value = useMemo(() => ({ enabled, play }), [enabled, play]);
  return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}

export function useSfx() {
  return useContext(SfxContext);
}
