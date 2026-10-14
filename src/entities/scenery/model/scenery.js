import * as THREE from 'three';

export class Scenery {
  constructor() {
    this.rock = new THREE.MeshStandardMaterial({ color: '#b3c1a0', flatShading: true, roughness: 1 });
    this.grass = new THREE.MeshStandardMaterial({ color: '#80b9a0', roughness: 1 });
    this.cloudMaterial = new THREE.MeshStandardMaterial({ color: '#fffaf1', roughness: 1 });
    this.trunkMaterial = new THREE.MeshStandardMaterial({ color: '#718b87', roughness: 1 });
    this.leafMaterial = new THREE.MeshStandardMaterial({ color: '#4c9292', roughness: 1, flatShading: true });
    this.rockGeometry = new THREE.ConeGeometry(1, 1, 6);
    this.topGeometry = new THREE.CylinderGeometry(1, 0.9, 0.2, 8);
    this.cloudGeometry = new THREE.IcosahedronGeometry(1, 2);
    this.trunkGeometry = new THREE.CylinderGeometry(0.08, 0.11, 1, 5);
    this.leafGeometry = new THREE.ConeGeometry(0.65, 1.8, 6);
  }

  island(radius) {
    const island = new THREE.Group();
    const rock = new THREE.Mesh(this.rockGeometry, this.rock);
    rock.rotation.z = Math.PI;
    rock.scale.set(radius, radius * 1.8, radius);
    rock.position.y = -radius * 0.9;
    island.add(rock);
    const top = new THREE.Mesh(this.topGeometry, this.grass);
    top.scale.set(radius, 1, radius);
    top.receiveShadow = true;
    island.add(top);
    for (let i = 0; i < 3; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(this.trunkGeometry, this.trunkMaterial);
      trunk.position.y = 0.5;
      const crown = new THREE.Mesh(this.leafGeometry, this.leafMaterial);
      crown.position.y = 1.6;
      tree.add(trunk, crown);
      tree.position.set((i - 1) * radius * 0.35, 0.1, Math.sin(i * 2) * radius * 0.3);
      tree.scale.setScalar(0.7 + i * 0.25);
      island.add(tree);
    }
    return island;
  }

  cloud(size) {
    const cloud = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(this.cloudGeometry, this.cloudMaterial);
      puff.scale.set(1.4, 0.72 + (i % 2) * 0.45, 1);
      puff.position.set((i - 1.5) * 1.1, Math.sin(i * 1.7) * 0.25, Math.cos(i * 2) * 0.4);
      cloud.add(puff);
    }
    cloud.scale.setScalar(size);
    return cloud;
  }

  setTheme(theme) {
    this.rock.color.set(theme.rock);
    this.grass.color.set(theme.grass);
  }
}
