import { FLIGHT } from '../../../shared/config/index.js';

export class Collection {
  constructor() { this.reset(); }
  reset() { this.coins = 0; this.score = 0; this.chain = 0; this.timer = 0; this.multiplier = 1; }

  step(dt) {
    this.timer = Math.max(0, this.timer - dt);
    if (!this.timer) { this.chain = 0; this.multiplier = 1; }
  }

  collect() {
    this.coins++;
    this.chain++;
    this.multiplier = Math.min(5, 1 + Math.floor(this.chain / 5));
    this.timer = FLIGHT.comboWindow;
    const reward = 10 * this.multiplier;
    this.score += reward;
    return reward;
  }

  check(coin, position, chunkZ) {
    if (coin.userData.collected) return false;
    const dx = position.x - coin.position.x;
    const dy = position.y - coin.position.y;
    const dz = coin.position.z + chunkZ;
    return dx * dx + dy * dy + dz * dz < FLIGHT.coinRadius ** 2;
  }
}
