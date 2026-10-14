import * as THREE from 'three';
import { createCoin, createCoinResources } from '../../../entities/coin/index.js';
import { Scenery } from '../../../entities/scenery/index.js';
import { FLIGHT } from '../../../shared/config/index.js';
import { coinPattern } from './patterns.js';

export class World {
  constructor(scene) {
    this.group = new THREE.Group();
    this.scenery = new Scenery();
    this.coinResources = createCoinResources();
    const ringGeometry = new THREE.TorusGeometry(3.1, 0.1, 6, 40);
    const ringMaterial = new THREE.MeshStandardMaterial({ color: '#fcf4cd', metalness: 0.5, roughness: 0.4, emissive: '#ffd99a', emissiveIntensity: 0.15 });
    this.chunks = Array.from({ length: FLIGHT.chunkCount }, (_, index) => {
      const group = new THREE.Group();
      const coins = Array.from({ length: 14 }, () => createCoin(this.coinResources));
      coins.forEach((coin) => group.add(coin));
      const props = [];
      for (let i = 0; i < 4; i++) {
        const island = this.scenery.island(2.5 + Math.random() * 4);
        group.add(island);
        props.push(island);
      }
      const clouds = Array.from({ length: 5 }, () => this.scenery.cloud(1.4 + Math.random() * 1.8));
      clouds.forEach((cloud) => group.add(cloud));
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      group.add(ring);
      this.group.add(group);
      return { group, coins, props, clouds, ring, index };
    });
    // Far mountains provide a steady horizon while near chunks are recycled.
    this.mountains = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const mountain = this.scenery.island(14 + Math.random() * 16);
      mountain.position.set((i % 2 ? -1 : 1) * (55 + Math.random() * 65), -25, -80 - Math.floor(i / 2) * 45);
      mountain.scale.y = 2.5;
      this.mountains.add(mountain);
    }
    this.group.add(this.mountains);
    scene.add(this.group);
    this.reset();
  }

  reset() {
    this.serial = 0;
    this.chunks.forEach((chunk, i) => { chunk.group.position.z = -i * FLIGHT.chunkLength - 20; this.populate(chunk); });
  }

  populate(chunk) {
    const serial = this.serial++;
    const pattern = serial < 2 ? 0 : serial % 4;
    const centerX = serial < 2 ? 0 : Math.sin(serial * 1.7) * 3.3;
    const centerY = serial < 2 ? 1 : 1.2 + Math.sin(serial * 0.8) * 1.8;
    chunk.coins.forEach((coin, i) => {
      const point = coinPattern(pattern, i, chunk.coins.length, centerX, centerY);
      coin.position.set(point.x, point.y, -i * 3.6);
      coin.visible = true;
      coin.userData.collected = false;
    });
    chunk.props.forEach((island, i) => {
      island.position.set((i % 2 ? -1 : 1) * (13 + Math.random() * 10), -6 - Math.random() * 7, -i * 15);
      island.rotation.y = Math.random() * Math.PI;
    });
    chunk.clouds.forEach((cloud, i) => cloud.position.set((i % 2 ? -1 : 1) * (15 + Math.random() * 24), 3 + Math.random() * 13, -i * 12));
    chunk.ring.position.set(centerX, centerY, -25);
  }

  step(travel, time) {
    for (const chunk of this.chunks) {
      chunk.group.position.z += travel;
      if (chunk.group.position.z > FLIGHT.chunkLength + 14) {
        const farthest = Math.min(...this.chunks.map((entry) => entry.group.position.z));
        chunk.group.position.z = farthest - FLIGHT.chunkLength;
        this.populate(chunk);
      }
      chunk.coins.forEach((coin, i) => { coin.rotation.y = time * 2.5 + i * 0.25; });
    }
  }

  setTheme(theme) { this.scenery.setTheme(theme); }
}
