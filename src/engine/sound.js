/**
 * Retro synth sound effects generator using standard Web Audio API.
 * This runs locally without requiring external audio assets.
 */

let audioCtx = null;
let enabled = true;

export function setSoundEnabled(val) {
  enabled = val;
  // Initialize context early on interaction if turning on
  if (val) {
    getAudioContext();
  }
}

export function isSoundEnabled() {
  return enabled;
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Basic retro sound generator.
 */
function playTone(freqs, times, type = 'sine', volume = 0.1) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime;
    
    // Set frequency path
    osc.frequency.setValueAtTime(freqs[0], startTime);
    times.forEach((t, i) => {
      if (i > 0) {
        osc.frequency.exponentialRampToValueAtTime(freqs[i], startTime + t);
      }
    });

    // Volume envelope (decay)
    gain.gain.setValueAtTime(volume, startTime);
    const duration = times[times.length - 1] || 0.15;
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (err) {
    console.warn("Web Audio playback failed:", err);
  }
}

export function playClick() {
  playTone([300, 600], [0, 0.06], 'sine', 0.08);
}

export function playMove() {
  playTone([160, 100], [0, 0.05], 'triangle', 0.15);
}

export function playJump() {
  playTone([180, 520], [0, 0.22], 'sine', 0.12);
}

export function playFail() {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime;
    osc.frequency.setValueAtTime(220, startTime);
    osc.frequency.linearRampToValueAtTime(60, startTime + 0.4);

    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.linearRampToValueAtTime(0.0001, startTime + 0.4);

    osc.start(startTime);
    osc.stop(startTime + 0.4);
  } catch (err) {
    console.warn(err);
  }
}

export function playSuccess() {
  if (!enabled) return;
  const tones = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 chords
  tones.forEach((tone, idx) => {
    setTimeout(() => {
      playTone([tone, tone * 1.5], [0, 0.18], 'sine', 0.05);
    }, idx * 90);
  });
}

export function playCoin() {
  // Retro double-beep high pitch coin collect sound
  if (!enabled) return;
  playTone([987.77, 1318.51], [0, 0.22], 'sine', 0.08);
}

export function playDoor() {
  playTone([160, 240, 140], [0, 0.12, 0.3], 'triangle', 0.1);
}
