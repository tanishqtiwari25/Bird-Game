import { clamp } from '../../../shared/lib/index.js';

export class FlightInput {
  constructor(canvas, joystick, boostButton) {
    this.keys = new Set();
    this.axes = { x: 0, y: 0 };
    this.tilt = { x: 0, y: 0 };
    this.tiltEnabled = false;
    this.boost = false;
    this.pointer = null;
    this.cleanup = [];
    this.stick = joystick.querySelector('.stick');
    const listen = (target, event, callback, options) => {
      target.addEventListener(event, callback, options);
      this.cleanup.push(() => target.removeEventListener(event, callback, options));
    };
    const relevant = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight'];
    listen(window, 'keydown', (event) => {
      if (!relevant.includes(event.code) || event.target.matches('input, select, textarea, button')) return;
      event.preventDefault();
      this.keys.add(event.code);
    });
    listen(window, 'keyup', (event) => this.keys.delete(event.code));
    listen(window, 'blur', () => this.reset());
    for (const target of [canvas, joystick]) {
      listen(target, 'pointerdown', (event) => {
        if (this.pointer !== null) return;
        event.preventDefault();
        this.pointer = event.pointerId;
        this.origin = { x: event.clientX, y: event.clientY };
        target.setPointerCapture(event.pointerId);
      });
      listen(target, 'pointermove', (event) => {
        if (this.pointer !== event.pointerId) return;
        this.axes.x = clamp((event.clientX - this.origin.x) / 55, -1, 1);
        this.axes.y = clamp((this.origin.y - event.clientY) / 55, -1, 1);
        this.stick.style.transform = `translate(${this.axes.x * 24}px, ${-this.axes.y * 24}px)`;
      });
      for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        listen(target, name, (event) => { if (event.pointerId === this.pointer) this.resetPointer(); });
      }
    }
    listen(boostButton, 'pointerdown', (event) => {
      event.preventDefault();
      boostButton.setPointerCapture(event.pointerId);
      this.boost = true;
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(boostButton, event, () => { this.boost = false; });
    listen(window, 'deviceorientation', (event) => {
      if (!this.tiltEnabled || event.gamma === null || event.beta === null) return;
      if (!this.tiltOrigin) this.tiltOrigin = { gamma: event.gamma, beta: event.beta };
      this.tilt.x = clamp((event.gamma - this.tiltOrigin.gamma) / 22, -1, 1);
      this.tilt.y = clamp((this.tiltOrigin.beta - event.beta) / 22, -1, 1);
    });
  }

  async enableTilt() {
    if (!window.DeviceOrientationEvent) return false;
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      if (await DeviceOrientationEvent.requestPermission() !== 'granted') return false;
    }
    this.tiltEnabled = !this.tiltEnabled;
    this.tiltOrigin = null;
    return this.tiltEnabled;
  }

  read() {
    const has = (...keys) => keys.some((key) => this.keys.has(key)) ? 1 : 0;
    return {
      x: clamp(has('ArrowRight', 'KeyD') - has('ArrowLeft', 'KeyA') + this.axes.x + (this.tiltEnabled ? this.tilt.x : 0), -1, 1),
      y: clamp(has('ArrowUp', 'KeyW') - has('ArrowDown', 'KeyS') + this.axes.y + (this.tiltEnabled ? this.tilt.y : 0), -1, 1),
      boost: this.boost || !!has('Space', 'ShiftLeft', 'ShiftRight'),
    };
  }

  resetPointer() {
    this.pointer = null;
    this.axes.x = this.axes.y = 0;
    this.stick.style.transform = '';
  }

  reset() { this.keys.clear(); this.boost = false; this.resetPointer(); }
  dispose() { this.reset(); this.cleanup.forEach((cleanup) => cleanup()); }
}
