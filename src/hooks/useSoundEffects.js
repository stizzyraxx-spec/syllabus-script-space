import { useRef } from "react";

export function useSoundEffects() {
  const audioContextRef = useRef(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playSound = (type) => {
    try {
      const ctx = getAudioContext();
      
      const soundConfigs = {
        missionSelect: {
          frequency: 523.25, // C5
          duration: 0.15,
          type: "sine",
          volume: 0.3,
        },
        decision: {
          frequency: 659.25, // E5
          duration: 0.12,
          type: "sine",
          volume: 0.25,
        },
        levelUp: {
          notes: [523.25, 659.25, 783.99], // C5, E5, G5
          duration: 0.2,
          type: "sine",
          volume: 0.35,
        },
      };

      const config = soundConfigs[type];
      if (!config) return;

      if (type === "levelUp") {
        // Play chord for level-up
        config.notes.forEach((freq, idx) => {
          setTimeout(() => {
            playTone(ctx, freq, config.duration, config.type, config.volume);
          }, idx * 100);
        });
      } else {
        // Play single tone
        playTone(ctx, config.frequency, config.duration, config.type, config.volume);
      }
    } catch (error) {
      console.log("Sound disabled or not supported");
    }
  };

  const playTone = (ctx, frequency, duration, waveType, volume) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = waveType;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  };

  return { playSound };
}