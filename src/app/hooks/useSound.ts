'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SoundId =
  | 'dice-roll'
  | 'correct'
  | 'incorrect'
  | 'step'
  | 'bonus'
  | 'portal'
  | 'victory';

const SOUND_FILES: Record<SoundId, string> = {
  'dice-roll': '/sounds/dice-roll.mp3',
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  step: '/sounds/step.mp3',
  bonus: '/sounds/bonus.mp3',
  portal: '/sounds/portal.mp3',
  victory: '/sounds/victory.mp3',
};

const SOUND_VOLUMES: Record<SoundId, number> = {
  'dice-roll': 0.5,
  correct: 0.7,
  incorrect: 0.7,
  step: 0.35,
  bonus: 0.8,
  portal: 0.8,
  victory: 0.9,
};

const FADE_OUT_MS = 180;

const SOUND_MAX_DURATION_MS: Partial<Record<SoundId, number>> = {
  correct: 1100,
  portal: 1500,
  'dice-roll': 1700,
};

const MUTE_STORAGE_KEY = 'tablegame:muted';

export function useSound() {
  const cacheRef = useRef<Partial<Record<SoundId, HTMLAudioElement>>>({});
  const missingRef = useRef<Set<SoundId>>(new Set());
  const stopTimerRef = useRef<Partial<Record<SoundId, ReturnType<typeof setTimeout>>>>({});
  const fadeTimerRef = useRef<Partial<Record<SoundId, ReturnType<typeof setInterval>>>>({});
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MUTE_STORAGE_KEY);
      if (stored === 'true') {
        setMuted(true);
        mutedRef.current = true;
      }
    } catch {
      // localStorage indisponível, segue sem persistência
    }
  }, []);

  const persistMute = useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, value ? 'true' : 'false');
    } catch {
      // ignora
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      persistMute(next);
      return next;
    });
  }, [persistMute]);

  const clearScheduled = (id: SoundId) => {
    const t = stopTimerRef.current[id];
    if (t) {
      clearTimeout(t);
      delete stopTimerRef.current[id];
    }
    const f = fadeTimerRef.current[id];
    if (f) {
      clearInterval(f);
      delete fadeTimerRef.current[id];
    }
  };

  const scheduleStop = (id: SoundId, audio: HTMLAudioElement, maxMs: number) => {
    const baseVolume = SOUND_VOLUMES[id];
    stopTimerRef.current[id] = setTimeout(() => {
      const steps = 8;
      const stepMs = FADE_OUT_MS / steps;
      let i = 0;
      fadeTimerRef.current[id] = setInterval(() => {
        i += 1;
        const next = baseVolume * (1 - i / steps);
        audio.volume = Math.max(0, next);
        if (i >= steps) {
          clearInterval(fadeTimerRef.current[id]!);
          delete fadeTimerRef.current[id];
          audio.pause();
          audio.currentTime = 0;
          audio.volume = baseVolume;
        }
      }, stepMs);
    }, Math.max(0, maxMs - FADE_OUT_MS));
  };

  const play = useCallback((id: SoundId) => {
    if (mutedRef.current) return;
    if (missingRef.current.has(id)) return;
    if (typeof window === 'undefined') return;

    let audio = cacheRef.current[id];
    if (!audio) {
      audio = new Audio(SOUND_FILES[id]);
      audio.preload = 'auto';
      audio.volume = SOUND_VOLUMES[id];
      audio.addEventListener('error', () => {
        missingRef.current.add(id);
      });
      cacheRef.current[id] = audio;
    }

    clearScheduled(id);
    audio.volume = SOUND_VOLUMES[id];

    try {
      audio.currentTime = 0;
      const result = audio.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          // Autoplay bloqueado ou arquivo ausente — falha silenciosa
        });
      }
      const max = SOUND_MAX_DURATION_MS[id];
      if (max) {
        scheduleStop(id, audio, max);
      }
    } catch {
      // Falha silenciosa
    }
  }, []);

  return { play, muted, toggleMute };
}
