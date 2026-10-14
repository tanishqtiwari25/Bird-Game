import * as THREE from 'three';
import { FlightGame } from '../../pages/game/index.js';
import { FLIGHT } from '../../shared/config/index.js';
import { disposeTree } from '../../shared/lib/index.js';
import { SaveManager } from './save-manager.js';
import { FlightAudio } from './audio.js';

export class Engine {
  constructor(root) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog('#c4e5e9', 50, 240);
    this.camera = new THREE.PerspectiveCamera(FLIGHT.cameraFov, 1, 0.1, 650);
    this.camera.position.set(0, 4, 10);
    this.save = new SaveManager();
    this.audio = new FlightAudio(this.save.data.sound);
    this.game = new FlightGame(root, this.scene, this.camera, this.audio, this.save);
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (error) {
      this.game.dom.fatal.hidden = false;
      this.game.dom.home.hidden = true;
      this.game.dom['play-btn'].disabled = true;
      this.game.dom['settings-btn'].disabled = true;
      console.error('WebGL initialization failed:', error);
      return;
    }
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, FLIGHT.maxPixelRatio));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.setAttribute('aria-label', 'Fly through the 3D world. Use arrow keys or WASD, or drag to steer.');
    this.game.attachCanvas(this.renderer.domElement);
    this.lighting();
    this.resize = () => {
      const width = this.game.dom.scene.clientWidth;
      const height = this.game.dom.scene.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', this.resize);
    this.resize();
    this.accumulator = 0;
    this.previous = performance.now();
    this.onVisibility = () => { this.previous = performance.now(); this.accumulator = 0; };
    document.addEventListener('visibilitychange', this.onVisibility);
    this.tick = this.tick.bind(this);
    this.frame = requestAnimationFrame(this.tick);
  }

  lighting() {
    const hemisphere = new THREE.HemisphereLight('#f0fdff', '#6a8f9a', 2.8);
    const sun = new THREE.DirectionalLight('#fff1d2', 3.2);
    sun.position.set(-25, 35, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.001;
    this.scene.add(hemisphere, sun);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(480, 20, 12), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { top: { value: new THREE.Color('#78c8de') }, bottom: { value: new THREE.Color('#e4f0e9') } },
      vertexShader: 'varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vPosition; void main(){float h=clamp(normalize(vPosition).y*1.6+0.15,0.0,1.0);gl_FragColor=vec4(mix(bottom,top,h),1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
    }));
    this.scene.add(sky);
    const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(12, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff0cb', fog: false }));
    sunDisk.position.set(-110, 90, -280);
    this.scene.add(sunDisk);
    this.game.onTheme = (theme) => {
      sky.material.uniforms.top.value.set(theme.sky).multiplyScalar(0.9);
      sky.material.uniforms.bottom.value.set(theme.fog);
    };
    this.game.setTheme();
  }

  tick(now) {
    const dt = Math.min((now - this.previous) / 1000, FLIGHT.maxFrame);
    this.previous = now;
    if (!document.hidden) {
      this.accumulator += dt;
      while (this.accumulator >= FLIGHT.fixedStep) {
        this.game.step(FLIGHT.fixedStep);
        this.accumulator -= FLIGHT.fixedStep;
      }
      this.game.render(dt);
      this.renderer.render(this.scene, this.camera);
    }
    this.frame = requestAnimationFrame(this.tick);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.game.dispose();
    this.audio.dispose();
    disposeTree(this.scene);
    this.scene.clear();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}
