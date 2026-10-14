export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const lerp = (a, b, alpha) => a + (b - a) * alpha;
export const smooth = (rate, dt) => 1 - Math.exp(-rate * dt);

// Shared geometries and materials are disposed once, even when used by a pool.
export function disposeTree(root) {
  const geometries = new Set();
  const materials = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
