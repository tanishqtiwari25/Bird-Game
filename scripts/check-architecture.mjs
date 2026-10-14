import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const layers = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'];
let imports = 0;

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) { await checkDirectory(filename); continue; }
    if (!filename.endsWith('.js')) continue;
    const source = await readFile(filename, 'utf8');
    const sourceParts = path.relative(root, filename).split(path.sep);
    for (const match of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
      const specifier = match[1];
      if (specifier === 'three') continue;
      assert(specifier.startsWith('.'), `Unexpected external import: ${specifier}`);
      const target = path.resolve(path.dirname(filename), specifier);
      await access(target);
      imports++;
      const targetParts = path.relative(root, target).split(path.sep);
      if (sourceParts[0] === 'main.js') continue;
      const sourceLayer = layers.indexOf(sourceParts[0]);
      const targetLayer = layers.indexOf(targetParts[0]);
      assert(sourceLayer >= 0 && targetLayer >= 0, `Unknown layer in ${filename}`);
      assert(targetLayer <= sourceLayer, `Upward dependency in ${filename}`);
      const sliceLayer = !['app', 'shared'].includes(sourceParts[0]);
      if (sourceLayer === targetLayer && sliceLayer) {
        assert.equal(sourceParts[1], targetParts[1], `Cross-slice dependency in ${filename}`);
      }
      if (targetLayer < sourceLayer) {
        assert(targetParts.length === 3 && targetParts[2] === 'index.js', `Use public API: ${specifier}`);
      }
    }
  }
}

await checkDirectory(root);
console.log(`FSD boundaries and ${imports} import paths passed.`);
