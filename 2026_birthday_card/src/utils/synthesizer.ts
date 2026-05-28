/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Procedurally synthesizes a warm and acoustic guitar-like pluck sound.
 * Uses multiple oscillators and a fast decay envelope so it is perfectly responsive.
 */
export function playPluckSound(frequency: number, audioContext?: AudioContext) {
  try {
    const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume audio context if locked
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscType1: OscillatorType = 'triangle';
    const oscType2: OscillatorType = 'sine';

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Configure oscillator 1: primary string tone
    osc1.type = oscType1;
    osc1.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Configure oscillator 2: higher harmonic octave
    osc2.type = oscType2;
    osc2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);

    // Add brief string frequency bend on release (gives nice natural guitar acoustic slide effect)
    osc1.frequency.exponentialRampToValueAtTime(frequency * 0.99, ctx.currentTime + 0.35);

    // Set Lowpass Filter to emulate body resonance (warmth and dampening high sizzle quickly)
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 4, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(frequency * 1.2, ctx.currentTime + 0.3);

    // Create realistic amplitude envelope
    // Sharp rise to mimic physical string pluck, followed by exponential decay
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.008); // Sharp attack
    gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.2); // Mid ring decay
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.82); // Long tail end

    // Node routing
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Playback
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);

    // Self garbage collection termination
    osc1.stop(ctx.currentTime + 0.85);
    osc2.stop(ctx.currentTime + 0.85);
  } catch (error) {
    console.warn("Web Audio Synthesis was blockaded by security sandboxing:", error);
  }
}

/**
 * Procedurally triggers a warm arpeggio harmonic chord sequence (e.g. C majestic chord or major G chord).
 */
export function playMagicalArpeggio(audioContext?: AudioContext) {
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
  try {
    const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playPluckSound(freq, ctx);
      }, idx * 140);
    });
  } catch (e) {
    console.warn("Web Audio API arpeggio blocked:", e);
  }
}
