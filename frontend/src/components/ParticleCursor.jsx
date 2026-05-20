import { useCallback } from 'react';
import { ParticlesProvider, Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#22c55e', '#f97316', '#eab308'];

const OPTIONS = {
  fullScreen: { enable: true, zIndex: 1 },
  background: { color: 'transparent' },
  fpsLimit: 60,
  particles: {
    number: { value: 0 },
    color: { value: COLORS },
    shape: { type: 'circle' },
    opacity: {
      value: { min: 0.1, max: 0.7 },
      animation: { enable: true, speed: 1.8, startValue: 'max', destroy: 'min' },
    },
    size: { value: { min: 2, max: 7 } },
    move: {
      enable: true,
      gravity: { enable: true, acceleration: 10 },
      speed: { min: 5, max: 16 },
      decay: 0.12,
      direction: 'none',
      random: true,
      outModes: { default: 'destroy', top: 'none' },
    },
    life: { count: 1 },
  },
  interactivity: {
    detectsOn: 'window',
    events: {
      onMove: { enable: true, mode: 'trail' },
    },
    modes: {
      trail: { delay: 0.06, quantity: 3, pauseOnStop: true },
    },
  },
  detectRetina: true,
};

export default function ParticleCursor() {
  const init = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <ParticlesProvider init={init}>
      <Particles id="tsparticles" options={OPTIONS} />
    </ParticlesProvider>
  );
}
