export const FLIGHT = Object.freeze({
  fixedStep: 1 / 60, maxFrame: 0.1, speed: 28, boostSpeed: 46,
  acceleration: 22, damping: 5.2, maxX: 8, minY: -2.5, maxY: 6,
  boostDrain: 0.23, boostRefill: 0.14, chunkLength: 64, chunkCount: 9,
  coinRadius: 1.35, comboWindow: 3.2, levelDistance: 1200,
  cameraFov: 55, boostFov: 62, maxPixelRatio: 1.6,
});

export const LEVELS = [
  { name: 'Sunlit Valley', subtitle: 'Find your wings', sky: '#b4dfeb', fog: '#c4e5e9', rock: '#b3c1a0', grass: '#80b9a0', accent: '#99f2d6' },
  { name: 'Amber Canyon', subtitle: 'Follow the golden hour', sky: '#f1d7bf', fog: '#eacdbd', rock: '#c4997e', grass: '#cdb987', accent: '#ffd4a1' },
  { name: 'Twilight Isles', subtitle: 'Chase the last light', sky: '#a9b1d7', fog: '#bdc0dc', rock: '#9393bb', grass: '#9ab3bc', accent: '#c7b9ff' },
];

export const STORAGE_KEY = 'skybound-save-v1';
