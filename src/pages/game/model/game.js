import * as THREE from 'three';
import { Bird } from '../../../entities/bird/index.js';
import { Sparkles } from '../../../entities/sparkles/index.js';
import { World } from '../../../features/explore-world/index.js';
import { Flight, FlightInput } from '../../../features/flight/index.js';
import { Collection } from '../../../features/collect-coins/index.js';
import { Progression } from '../../../features/progression/index.js';
import { FLIGHT } from '../../../shared/config/index.js';
import { smooth, lerp } from '../../../shared/lib/index.js';
import { createScreen } from '../ui/screen.js';

export class FlightGame {
  constructor(root, scene, camera, audio, save) {
    this.root = root;
    this.scene = scene;
    this.camera = camera;
    this.audio = audio;
    this.save = save;
    this.dom = createScreen(root);
    this.shell = root.querySelector('.flight-shell');
    this.bird = new Bird();
    scene.add(this.bird.group);
    this.world = new World(scene);
    this.sparkles = new Sparkles(scene);
    this.flight = new Flight();
    this.collection = new Collection();
    this.progression = new Progression();
    this.mode = 'home';
    this.time = 0;
    this.previewTime = 0;
    this.saveTime = 0;
    this.sessionTime = 0;
    this.toastTime = 0;
    this.uiTime = 0;
    this.reduced = save.data.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cleanup = [];
    this.lookTarget = new THREE.Vector3();
    this.cameraTarget = new THREE.Vector3();
    this.updateHome();
    this.bindUI();
  }

  attachCanvas(canvas) {
    this.dom.scene.append(canvas);
    this.input = new FlightInput(canvas, this.dom.joystick, this.dom['boost-btn']);
  }

  bindUI() {
    const listen = (target, event, callback) => {
      target.addEventListener(event, callback);
      this.cleanup.push(() => target.removeEventListener(event, callback));
    };
    const click = (id, callback) => listen(this.dom[id], 'click', callback);
    click('play-btn', () => this.start());
    click('pause-btn', () => this.pause());
    click('resume-btn', () => this.resume());
    click('restart-btn', () => this.start());
    click('again-btn', () => this.start());
    click('finish-btn', () => this.finish());
    click('home-btn', () => this.home());
    listen(this.root.querySelector('.brand'), 'click', (event) => { event.preventDefault(); if (this.mode === 'running') this.pause(); else if (this.mode === 'home') this.home(); });
    click('sound-btn', () => this.setSound(!this.audio.enabled));
    listen(this.dom['sound-setting'], 'change', (event) => this.setSound(event.target.checked));
    listen(this.dom['effects-setting'], 'change', (event) => {
      this.reduced = event.target.checked;
      this.save.data.reduced = this.reduced;
      this.shell.classList.toggle('reduced', this.reduced);
      this.sparkles.reset();
      this.save.flush();
    });
    click('settings-btn', () => {
      this.settingsResume = this.mode === 'running';
      if (this.settingsResume) { this.mode = 'paused'; this.input.reset(); }
      this.dom['sound-setting'].checked = this.audio.enabled;
      this.dom['effects-setting'].checked = this.reduced;
      this.dom['settings-dialog'].showModal();
    });
    click('close-settings', () => this.dom['settings-dialog'].close());
    listen(this.dom['settings-dialog'], 'close', () => {
      if (this.settingsResume && this.mode === 'paused' && !document.hidden) this.resume();
      this.settingsResume = false;
    });
    click('tilt-btn', async () => {
      try {
        const enabled = await this.input.enableTilt();
        this.dom['tilt-btn'].textContent = enabled ? 'Disable' : 'Enable';
        if (!enabled && !window.DeviceOrientationEvent) this.notify('Tilt steering needs a mobile device with motion sensors.');
        else if (enabled) this.notify('Tilt enabled. Hold your phone comfortably to calibrate.');
      } catch { this.notify('Motion access wasn’t available. Touch controls are ready.'); }
    });
    listen(window, 'keydown', (event) => {
      if (!['Escape', 'KeyP'].includes(event.code) || this.dom['settings-dialog'].open || this.dom['summary-dialog'].open) return;
      if (this.mode === 'running') { event.preventDefault(); this.pause(); }
      else if (this.mode === 'paused') { event.preventDefault(); this.resume(); }
    });
    listen(this.dom['pause-dialog'], 'cancel', (event) => { event.preventDefault(); this.resume(); });
    listen(this.dom['summary-dialog'], 'cancel', (event) => { event.preventDefault(); this.home(); });
    listen(document, 'visibilitychange', () => { if (document.hidden) { this.pause(); this.save.flush(); } });
    listen(window, 'blur', () => { if (this.mode === 'running') this.pause(); });
    listen(window, 'pagehide', () => this.save.flush());
    this.setSound(this.audio.enabled, false);
    this.shell.classList.toggle('reduced', this.reduced);
  }

  setSound(enabled, unlock = true) {
    this.audio.enabled = enabled;
    this.save.data.sound = enabled;
    this.dom['sound-btn'].setAttribute('aria-pressed', String(enabled));
    this.dom['sound-btn'].setAttribute('aria-label', enabled ? 'Mute sound' : 'Enable sound');
    this.dom['sound-btn'].classList.toggle('muted', !enabled);
    this.dom['sound-setting'].checked = enabled;
    this.save.flush();
    if (enabled && unlock) this.audio.unlock();
  }

  closeDialogs() {
    this.settingsResume = false;
    for (const dialog of this.root.querySelectorAll('dialog[open]')) dialog.close();
  }

  start() {
    this.closeDialogs();
    this.audio.unlock();
    this.flight.reset();
    this.collection.reset();
    this.progression.reset();
    this.world.reset();
    this.sparkles.reset();
    this.input.reset();
    this.bird.group.position.set(0, 1, 0);
    this.mode = 'running';
    this.shell.dataset.mode = 'running';
    this.dom.home.hidden = true;
    this.save.data.flights++;
    this.save.flush();
    document.activeElement?.blur();
    this.setTheme();
    this.updateHUD();
    this.notify('Follow the gold. Your first adventure starts here.');
  }

  pause() {
    if (this.mode !== 'running') return;
    this.mode = 'paused';
    this.input.reset();
    this.save.flush();
    if (!this.dom['settings-dialog'].open) this.dom['pause-dialog'].showModal();
  }

  resume() {
    this.closeDialogs();
    this.input.reset();
    this.mode = 'running';
    document.activeElement?.blur();
    this.audio.unlock();
  }

  finish() {
    this.closeDialogs();
    this.mode = 'summary';
    this.save.flush();
    this.dom['summary-score'].textContent = this.collection.score.toLocaleString();
    this.dom['summary-coins'].textContent = this.collection.coins;
    this.dom['summary-distance'].textContent = `${Math.floor(this.flight.distance)} m`;
    this.dom['summary-caption'].textContent = this.collection.score > 0 && this.collection.score >= this.save.data.best ? 'A new personal best. Look at you soar.' : 'Every flight is a fresh perspective.';
    this.dom['summary-dialog'].showModal();
  }

  home() {
    this.closeDialogs();
    this.mode = 'home';
    this.shell.dataset.mode = 'home';
    this.dom.home.hidden = false;
    this.flight.reset();
    this.progression.reset();
    this.world.reset();
    this.sparkles.reset();
    this.setTheme();
    this.updateHome();
  }

  updateHome() {
    this.dom['home-best'].innerHTML = `${this.save.data.best.toLocaleString()} <small>pts</small>`;
    this.dom['home-wallet'].innerHTML = `${this.save.data.wallet.toLocaleString()} <small>coins</small>`;
  }

  setTheme() {
    const theme = this.progression.theme;
    this.scene.background = new THREE.Color(theme.sky);
    this.scene.fog.color.set(theme.fog);
    this.world.setTheme(theme);
    this.onTheme?.(theme);
    this.shell.style.setProperty('--level-accent', theme.accent);
  }

  notify(message) {
    this.dom.notice.textContent = message;
    this.dom.notice.classList.add('visible');
    this.noticeTime = 4;
  }

  step(dt) {
    if (this.mode !== 'running') return;
    this.time += dt;
    this.sessionTime += dt;
    const travel = this.flight.step(dt, this.input.read());
    this.world.step(travel, this.time);
    this.collection.step(dt);
    for (const chunk of this.world.chunks) {
      for (const coin of chunk.coins) {
        if (!this.collection.check(coin, this.flight, chunk.group.position.z)) continue;
        coin.userData.collected = true;
        coin.visible = false;
        this.collection.collect();
        this.save.data.wallet++;
        this.save.data.best = Math.max(this.save.data.best, this.collection.score);
        this.audio.coin(this.collection.chain);
        if (!this.reduced) {
          this.sparkles.burst(coin.position.x, coin.position.y, coin.position.z + chunk.group.position.z);
          if (navigator.vibrate) navigator.vibrate(8);
          this.dom['coins'].classList.remove('pop');
          void this.dom['coins'].offsetWidth;
          this.dom['coins'].classList.add('pop');
        }
      }
    }
    this.sparkles.step(dt);
    if (this.progression.step(this.flight.distance)) {
      this.setTheme();
      this.audio.level();
      this.dom['level-toast'].querySelector('strong').textContent = this.progression.theme.name;
      this.dom['level-toast'].classList.add('visible');
      this.toastTime = 3.5;
      this.save.flush();
    }
    if (this.sessionTime >= 1800) { this.notify('A little breather? Your progress is saved. Take a break whenever you like.'); this.sessionTime = 0; }
    this.saveTime += dt;
    if (this.saveTime > 5) { this.save.flush(); this.saveTime = 0; }
  }

  render(dt) {
    const active = this.mode === 'running';
    const narrowPreview = this.mode === 'home' && this.camera.aspect < 0.9;
    if (this.mode === 'home') {
      this.previewTime += dt;
      this.world.step(dt * 3, this.previewTime);
      this.bird.group.position.set(narrowPreview ? 0.3 : 3.3, 1.7 + (this.reduced ? 0 : Math.sin(this.previewTime * 1.4) * 0.2), 0);
      this.bird.body.rotation.y = -0.2;
    } else {
      this.bird.body.rotation.y = 0;
      const alpha = smooth(16, dt);
      this.bird.group.position.x = lerp(this.bird.group.position.x, this.flight.x, alpha);
      this.bird.group.position.y = lerp(this.bird.group.position.y, this.flight.y, alpha);
    }
    const animationTime = this.mode === 'home' ? this.previewTime : this.time;
    this.bird.update(animationTime, dt, { x: active ? this.flight.vx : 0, y: active ? this.flight.vy : 0 }, this.reduced, this.flight.boosting && active);
    const bx = this.bird.group.position.x;
    const by = this.bird.group.position.y;
    this.cameraTarget.set(this.mode === 'home' ? 0 : bx * 0.52, by + 2.1, this.mode === 'home' ? 9 : 9.8);
    this.camera.position.lerp(this.cameraTarget, smooth(3, dt));
    this.lookTarget.set(this.mode === 'home' ? (narrowPreview ? 0.3 : 1) : bx * 0.6, narrowPreview ? by - 6 : by + 0.25, -11);
    this.camera.lookAt(this.lookTarget);
    const targetFov = this.flight.boosting && active && !this.reduced ? FLIGHT.boostFov : FLIGHT.cameraFov;
    const fov = lerp(this.camera.fov, targetFov, smooth(4, dt));
    if (Math.abs(this.camera.fov - fov) > 0.001) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
    this.toastTime = Math.max(0, this.toastTime - dt);
    if (!this.toastTime) this.dom['level-toast'].classList.remove('visible');
    this.noticeTime = Math.max(0, (this.noticeTime || 0) - dt);
    if (!this.noticeTime) this.dom.notice.classList.remove('visible');
    this.uiTime += dt;
    if (this.uiTime > 0.08 && this.mode !== 'home') { this.updateHUD(); this.uiTime = 0; }
  }

  updateHUD() {
    const c = this.collection;
    const progress = this.progression.progress(this.flight.distance);
    this.dom.score.textContent = String(c.score).padStart(4, '0');
    this.dom.coins.textContent = c.coins;
    this.dom.level.textContent = `LEVEL ${String(this.progression.level).padStart(2, '0')}`;
    this.dom['level-name'].textContent = this.progression.theme.name;
    this.dom['route-title'].textContent = progress > 0.85 ? 'The next horizon is close' : `Explore ${this.progression.theme.name}`;
    this.dom['route-percent'].textContent = `${Math.floor(progress * 100)}%`;
    this.dom['level-fill'].style.width = `${progress * 100}%`;
    this.dom.distance.textContent = `${Math.floor(this.flight.distance).toLocaleString()} m travelled`;
    this.dom['next-level'].textContent = `Level ${String(this.progression.level + 1).padStart(2, '0')} ↗`;
    this.dom.combo.textContent = `×${c.multiplier}`;
    this.dom['combo-fill'].style.width = `${c.timer / FLIGHT.comboWindow * 100}%`;
    this.dom['boost-fill'].style.width = `${this.flight.energy * 100}%`;
    this.dom['boost-btn'].classList.toggle('boosting', this.flight.boosting);
  }

  dispose() {
    this.save.flush();
    this.input?.dispose();
    this.cleanup.forEach((cleanup) => cleanup());
  }
}
