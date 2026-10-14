import * as THREE from 'three';

const COUNT = 160;
export class Sparkles {
  constructor(scene) {
    this.positions = new Float32Array(COUNT * 3);
    this.velocities = new Float32Array(COUNT * 3);
    this.life = new Float32Array(COUNT);
    this.positions.fill(9999);
    this.cursor = 0;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    const material = new THREE.PointsMaterial({ color: '#ffdfa0', size: 0.16, transparent: true, opacity: 0.9, depthWrite: false });
    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  burst(x, y, z) {
    for (let n = 0; n < 12; n++) {
      const index = this.cursor++ % COUNT;
      const i = index * 3;
      this.positions.set([x, y, z], i);
      this.velocities.set([(Math.random() - 0.5) * 5, (Math.random() - 0.3) * 4, Math.random() * 3], i);
      this.life[index] = 0.55;
    }
  }

  step(dt) {
    for (let n = 0; n < COUNT; n++) {
      if (this.life[n] <= 0) continue;
      this.life[n] -= dt;
      for (let axis = 0; axis < 3; axis++) this.positions[n * 3 + axis] += this.velocities[n * 3 + axis] * dt;
      if (this.life[n] <= 0) this.positions[n * 3 + 1] = 9999;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  reset() { this.life.fill(0); this.positions.fill(9999); this.points.geometry.attributes.position.needsUpdate = true; }
}
