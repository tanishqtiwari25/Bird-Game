export class FlightAudio {
  constructor(enabled) { this.enabled = enabled; this.context = null; }

  async unlock() {
    if (!this.enabled) return;
    try {
      if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch { this.enabled = false; }
  }

  tone(frequency, duration = 0.16, volume = 0.07, delay = 0) {
    if (!this.enabled || this.context?.state !== 'running') return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  coin(chain) { this.tone(580 * 2 ** (Math.min(chain, 15) / 18)); this.tone(1160, 0.09, 0.025, 0.04); }
  level() { [523, 659, 784, 1047].forEach((note, i) => this.tone(note, 0.4, 0.045, i * 0.09)); }
  dispose() { this.context?.close(); }
}
