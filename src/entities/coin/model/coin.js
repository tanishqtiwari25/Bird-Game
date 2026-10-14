import * as THREE from 'three';

export function createCoinResources() {
  return {
    geometry: new THREE.CylinderGeometry(0.43, 0.43, 0.11, 16),
    material: new THREE.MeshStandardMaterial({ color: '#ffd36a', metalness: 0.7, roughness: 0.27, emissive: '#dd8c22', emissiveIntensity: 0.32 }),
    rim: new THREE.TorusGeometry(0.35, 0.026, 4, 16),
  };
}

export function createCoin(resources) {
  const group = new THREE.Group();
  const disk = new THREE.Mesh(resources.geometry, resources.material);
  disk.rotation.x = Math.PI / 2;
  group.add(disk);
  const rim = new THREE.Mesh(resources.rim, resources.material);
  rim.position.z = 0.067;
  group.add(rim);
  group.userData.collected = false;
  return group;
}
