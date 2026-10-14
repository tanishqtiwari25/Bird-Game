import { FLIGHT, LEVELS } from '../../../shared/config/index.js';

export class Progression {
  reset() { this.level = 1; this.lastLevel = 1; }
  constructor() { this.reset(); }
  step(distance) {
    this.level = 1 + Math.floor(distance / FLIGHT.levelDistance);
    const changed = this.level !== this.lastLevel;
    this.lastLevel = this.level;
    return changed;
  }
  get theme() { return LEVELS[(this.level - 1) % LEVELS.length]; }
  progress(distance) { return (distance % FLIGHT.levelDistance) / FLIGHT.levelDistance; }
}
