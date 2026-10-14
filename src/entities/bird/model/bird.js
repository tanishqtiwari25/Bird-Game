import * as THREE from 'three';
import { smooth, lerp } from '../../../shared/lib/index.js';

export class Bird {
  constructor() {
    this.group = new THREE.Group();
    this.body = new THREE.Group();
    this.group.add(this.body);
    const aqua = new THREE.MeshStandardMaterial({ color: '#24aab1', roughness: 0.55, flatShading: true });
    const cream = new THREE.MeshStandardMaterial({ color: '#fff5de', roughness: 0.8 });
    const dark = new THREE.MeshStandardMaterial({ color: '#173746', roughness: 0.6 });
    const orange = new THREE.MeshStandardMaterial({ color: '#ffb968', roughness: 0.6, flatShading: true });
    const mesh = (geometry, material, position, scale = [1, 1, 1]) => {
      const part = new THREE.Mesh(geometry, material);
      part.position.set(...position);
      part.scale.set(...scale);
      part.castShadow = true;
      this.body.add(part);
      return part;
    };
    mesh(new THREE.IcosahedronGeometry(0.78, 2), aqua, [0, 0, 0], [0.83, 0.86, 1.25]);
    mesh(new THREE.SphereGeometry(0.55, 16, 12), cream, [0, -0.2, -0.12], [0.92, 0.8, 1.35]);
    mesh(new THREE.IcosahedronGeometry(0.59, 2), aqua, [0, 0.45, -0.66]);
    for (const side of [-1, 1]) {
      mesh(new THREE.SphereGeometry(0.19, 12, 10), cream, [side * 0.44, 0.54, -0.93], [0.6, 1, 1]);
      mesh(new THREE.SphereGeometry(0.1, 12, 8), dark, [side * 0.5, 0.55, -1.01], [0.6, 1, 1]);
      const wing = new THREE.Group();
      wing.position.set(side * 0.45, 0.08, 0.12);
      const feather = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), aqua);
      feather.scale.set(1.9, 0.16, 0.72);
      feather.position.x = side * 0.85;
      feather.rotation.y = side * 0.18;
      wing.add(feather);
      for (let i = 0; i < 3; i++) {
        const tip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), i === 2 ? cream : aqua);
        tip.scale.set(1.6, 0.18, 0.7);
        tip.position.set(side * (1.45 + i * 0.12), -0.01, 0.05 + i * 0.23);
        wing.add(tip);
      }
      this.body.add(wing);
      if (side === -1) this.leftWing = wing;
      else this.rightWing = wing;
      const tail = mesh(new THREE.ConeGeometry(0.19, 0.8, 4), aqua, [side * 0.17, 0.1, 1]);
      tail.rotation.x = Math.PI / 2;
      tail.rotation.z = side * 0.18;
    }
    const beak = mesh(new THREE.ConeGeometry(0.22, 0.5, 4), orange, [0, 0.35, -1.3]);
    beak.rotation.x = -Math.PI / 2;
    mesh(new THREE.ConeGeometry(0.13, 0.45, 4), aqua, [0, 1.02, -0.5]);
    this.group.traverse((part) => { if (part.isMesh) part.castShadow = true; });
  }

  update(time, dt, velocity, reduced, boosting) {
    const flap = Math.sin(time * (boosting ? 19 : 11)) * (reduced ? 0.15 : 0.38);
    this.leftWing.rotation.z = flap;
    this.rightWing.rotation.z = -flap;
    this.body.rotation.z = lerp(this.body.rotation.z, -velocity.x * 0.035, smooth(8, dt));
    this.body.rotation.x = lerp(this.body.rotation.x, velocity.y * 0.025, smooth(8, dt));
    this.body.position.y = reduced ? 0 : Math.sin(time * 3) * 0.06;
  }
}
