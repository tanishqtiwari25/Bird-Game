import { STORAGE_KEY } from '../../shared/config/index.js';

export class SaveManager {
  constructor(storage) {
    this.storage = storage;
    this.available = true;
    this.data = { best: 0, wallet: 0, sound: true, reduced: false, flights: 0 };
    try {
      this.storage ??= globalThis.localStorage;
      const saved = JSON.parse(this.storage.getItem(STORAGE_KEY) || '{}');
      for (const key of ['best', 'wallet', 'flights']) {
        if (Number.isFinite(saved[key]) && saved[key] >= 0) this.data[key] = saved[key];
      }
      for (const key of ['sound', 'reduced']) if (typeof saved[key] === 'boolean') this.data[key] = saved[key];
    } catch { this.available = false; }
  }

  flush() {
    try { this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data)); }
    catch { this.available = false; }
  }
}
