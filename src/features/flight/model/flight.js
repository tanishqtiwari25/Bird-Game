import { FLIGHT } from '../../../shared/config/index.js';
import { clamp } from '../../../shared/lib/index.js';

export class Flight {
  constructor() { this.reset(); }

  reset() {
    this.x = 0;
    this.y = 1;
    this.vx = 0;
    this.vy = 0;
    this.energy = 1;
    this.boosting = false;
    this.boostExhausted = false;
    this.distance = 0;
  }

  step(dt, input) {
    this.vx += input.x * FLIGHT.acceleration * dt;
    this.vy += input.y * FLIGHT.acceleration * dt;
    const damping = Math.exp(-FLIGHT.damping * dt);
    this.vx *= damping;
    this.vy *= damping;
    this.x = clamp(this.x + this.vx * dt, -FLIGHT.maxX, FLIGHT.maxX);
    this.y = clamp(this.y + this.vy * dt, FLIGHT.minY, FLIGHT.maxY);
    if (this.energy <= 0.02) this.boostExhausted = true;
    if (this.energy >= 0.2 || !input.boost) this.boostExhausted = false;
    this.boosting = input.boost && this.energy > 0.02 && !this.boostExhausted;
    this.energy = clamp(this.energy + (this.boosting ? -FLIGHT.boostDrain : FLIGHT.boostRefill) * dt, 0, 1);
    const speed = this.boosting ? FLIGHT.boostSpeed : FLIGHT.speed;
    const travel = speed * dt;
    this.distance += travel;
    return travel;
  }
}
