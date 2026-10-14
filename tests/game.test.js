import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Flight } from '../src/features/flight/index.js';
import { Collection } from '../src/features/collect-coins/index.js';
import { Progression } from '../src/features/progression/index.js';
import { World } from '../src/features/explore-world/index.js';
import { SaveManager } from '../src/app/model/save-manager.js';
import { FLIGHT } from '../src/shared/config/index.js';
import { disposeTree } from '../src/shared/lib/index.js';

test('flight accelerates, damps, stays bounded, and boost drains and refills', () => {
  const flight = new Flight();
  flight.step(1 / 60, { x: 1, y: 1, boost: false });
  assert(flight.x > 0 && flight.x < 0.01);
  for (let i = 0; i < 600; i++) flight.step(1 / 60, { x: 1, y: 1, boost: true });
  assert.equal(flight.x, FLIGHT.maxX);
  assert.equal(flight.y, FLIGHT.maxY);
  assert(flight.energy >= 0 && flight.energy < 0.21);
  const vx = flight.vx;
  for (let i = 0; i < 120; i++) flight.step(1 / 60, { x: 0, y: 0, boost: false });
  assert(flight.vx < vx * 0.01);
  assert(flight.energy > 0.2);
  flight.reset();
  assert.equal(flight.distance, 0);
});

test('combo rewards grow and expire, collected coins cannot score twice', () => {
  const collection = new Collection();
  const coin = { position: { x: 0, y: 1, z: -1 }, userData: { collected: false } };
  assert(collection.check(coin, { x: 0, y: 1 }, 1));
  coin.userData.collected = true;
  assert.equal(collection.check(coin, { x: 0, y: 1 }, 1), false);
  for (let i = 0; i < 5; i++) collection.collect();
  assert.equal(collection.multiplier, 2);
  assert.equal(collection.score, 60);
  collection.step(4);
  assert.equal(collection.multiplier, 1);
  assert.equal(collection.timer, 0);
});

test('level transitions happen once at each distance threshold', () => {
  const progression = new Progression();
  assert.equal(progression.step(1199), false);
  assert.equal(progression.step(1200), true);
  assert.equal(progression.step(1201), false);
  assert.equal(progression.level, 2);
  assert.equal(progression.theme.name, 'Amber Canyon');
});

test('long runs recycle chunks without allocating new scene objects', () => {
  const scene = new THREE.Scene();
  const world = new World(scene);
  let initial = 0;
  scene.traverse(() => initial++);
  const firstCoin = world.chunks[0].coins[0];
  firstCoin.visible = false;
  firstCoin.userData.collected = true;
  for (let i = 0; i < 12000; i++) world.step(FLIGHT.speed / 60, i / 60);
  let final = 0;
  scene.traverse(() => final++);
  assert.equal(final, initial);
  assert(world.serial > 80);
  assert(world.chunks.every((chunk) => chunk.group.position.z <= FLIGHT.chunkLength + 14));
  world.reset();
  assert.equal(world.chunks[0].coins[0], firstCoin);
  assert.equal(firstCoin.visible, true);
  assert.equal(firstCoin.userData.collected, false);
  disposeTree(scene);
});

test('save survives reload, validates data, and tolerates unavailable storage', () => {
  const items = new Map();
  const storage = { getItem: (key) => items.get(key), setItem: (key, value) => items.set(key, value) };
  const save = new SaveManager(storage);
  save.data.best = 120;
  save.data.wallet = 12;
  save.flush();
  assert.equal(new SaveManager(storage).data.wallet, 12);
  const broken = new SaveManager({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
  assert.equal(broken.data.best, 0);
  assert.doesNotThrow(() => broken.flush());
  assert.equal(broken.available, false);
});
