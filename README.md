# Skybound — Bird Game, Phase 1

A complete Three.js flight game built with vanilla JavaScript and Vite. The previous Phaser game has been upgraded into a 3D chase-camera experience while retaining bird movement, coin collection, and 10-point base rewards. The earlier request for **Feature-Sliced Design** takes precedence over the flat `core/world/systems/ui` structure in the reference brief.

## Architecture

Dependencies flow down: `app → pages → features → entities → shared`. Each slice exports its public API from `index.js`. Related slices never import one another on the same layer. The Game page composes otherwise independent gameplay features; the App layer owns browser lifecycle and services. No framework is needed.

```text
index.html
game.js                          Compatibility entry; Vite boots src/main.js
package.json
package-lock.json
vite.config.js                   Relative production asset URLs
src/
  main.js                        Bootstrap and HMR cleanup
  app/
    index.js
    model/
      engine.js                  Three.js renderer, sky, lighting, fixed-step loop
      audio.js                   Procedural Web Audio chimes
      save-manager.js            Validated localStorage saves, graceful fallback
    styles/global.css            Responsive HUD, menus, settings
  pages/game/
    index.js
    model/game.js                Compose flight, collection, world and progression
    ui/screen.js                 Home, HUD, pause, settings and flight summary
  features/
    flight/
      index.js
      model/flight.js            Acceleration, damping, flight bounds, boost energy
      model/input.js             WASD/arrows, drag, joystick and optional tilt
    collect-coins/
      index.js
      model/collection.js        Distance collision, reward, combo and expiry
    explore-world/
      index.js
      model/world.js             Recycled chunks and shared mesh resources
      model/patterns.js          Lines, arcs, spirals and hearts
    progression/
      index.js
      model/progression.js       Distance checkpoints and palette progression
  entities/
    bird/
      index.js
      model/bird.js              Primitive bird, wing flaps, banking and bobbing
    coin/
      index.js
      model/coin.js              Metallic emissive coin geometry
    scenery/
      index.js
      model/scenery.js           Clouds, floating islands, trees and mountains
    sparkles/
      index.js
      model/sparkles.js          Fixed particle pool for collection bursts
  shared/
    config/index.js             Flight tuning and theme data
    lib/index.js                Math helpers and GPU resource disposal
scripts/check-architecture.mjs    Import boundaries and file resolution
tests/game.test.js                Gameplay, pool and persistence regression tests
```

## Run

Use Node.js 20.19+, 22.12+ or a supported newer version. The local implementation was built with Node 24.13.0, Three.js 0.186.1 and Vite 8.3.4; the lockfile records exact dependency versions.

```sh
npm install
npm run dev
```

Open **http://localhost:5173/**. Click **Let’s fly** to begin. Use **WASD / arrows** to steer, **Space / Shift** to boost, and **Esc / P** to pause. Mouse/touch dragging steers relative to the press position. On touch devices, a joystick appears. The boost button works while held and replenishes after use.

If port 5173 is in use:

```sh
npm run dev -- --port 5187
```

For a phone on the same trusted Wi-Fi network, run `npm run dev -- --host 0.0.0.0` and visit the computer’s LAN IP with that port. Touch controls do not need sensor access. Tilt is optional, enabled in Settings; it needs a supported sensor/browser, and some devices require HTTPS and a motion permission prompt. Tilting is calibrated to the phone’s position when the first sensor event arrives. Rotate/recalibrate by disabling and re-enabling tilt. Physical mobile sensor testing remains necessary.

## Build and checks

```sh
npm run check
npm test
npm run build
npm run preview
```

`dist/` is the deployable static output. Vite must build the source before GitHub Pages deployment; copying the raw Three.js source to Pages does not resolve npm imports. The existing CNAME and original `asset/` files can remain in the repository; the 3D game uses generated primitives instead of those sprite images.

`.github/workflows/pages.yml` installs locked dependencies, checks the FSD boundaries, runs tests, builds the game, retains the custom domain, and deploys only `dist/` on pushes to `main`. GitHub Pages must use **GitHub Actions** as its publishing source. The existing custom domain is `bird.realtanishqtiwari.in`. CSS is linked as a stylesheet in the source HTML; Vite emits separate hashed JavaScript and CSS files for production. Avoid serving the source folder through GitHub Pages or Live Server; use `npm run dev` locally or publish the compiled build.

## Phase 1 checklist

- [x] Third-person camera with smooth follow and boost FOV change.
- [x] Stylized 3D bird with flapping, banking, tilt and idle bobbing.
- [x] Keyboard, pointer drag, touch joystick, and opt-in tilt controls.
- [x] Acceleration and damping, rechargeable boost, fixed 60 Hz simulation.
- [x] Forward flight through pooled clouds, islands, rings and mountain scenery.
- [x] Shared coin geometry/materials, spin, emissive gold, four pattern families.
- [x] Distance collision, score, collected coins, combo multiplier, decaying combo meter.
- [x] Level HUD, distance progress, repeating theme checkpoints.
- [x] Responsive menus, pause/resume, fresh start, finish summary and restart.
- [x] Web Audio chimes, saved best score, lifetime coins and settings.
- [x] Resize handling, visibility/blur pause and GPU/listener/audio cleanup.
- [x] Reduced-effects option and an optional break reminder after 30 minutes of active flight.
- [x] Architecture checker, production build and gameplay regression tests.

## Scope and assumptions

This delivery implements **Phase 1 first**, as requested. It is a free-flight coin runner with no death or collision hazards yet. Rings are scenic route markers. A distance checkpoint occurs every 1,200 metres; three starter palettes (Sunlit Valley, Amber Canyon, Twilight Isles) repeat indefinitely. These are procedural routes, not the ten handcrafted levels specified for Phase 3.

Phase 2’s bloom/composer, instancing, automatic quality presets and device FPS targets are not implemented or performance-certified. Phase 3’s obstacles, power-ups, missions and bosses, and Phase 4’s shop, daily rewards, ghosts, leaderboard, revive and adaptive music are future work. Coin combo, chimes, bursts, progression and saved scores already function as part of the core.

The renderer caps pixel ratio to 1.6. Fonts optionally load from Google Fonts with system fallbacks; no external models, textures or sound files are required. Saves belong to the browser origin (scheme, host and port): `localhost:5173` and `127.0.0.1:5173` have separate saves. Clearing site storage clears progress. Storage restrictions leave the game playable without persistence.

Automated tests cover acceleration/damping, bounds, boost energy, combo expiry, collision duplication prevention, checkpoints, storage failures and long-running object-pool reuse. Live browser checks also verified the 3D scene, scoring/combo, pause, flight summary, settings, joystick input, desktop and 390 × 844 portrait layouts, and saved progress after reload. A test flight collected 54 coins for 1,470 points. No warning/error logs appeared for the final corrected localhost preview. Physical mobile sensors and device FPS targets remain untested.

## Optional asset replacements

The bird and scenery are procedural primitives. For a future model/audio pass, consider [Kenney](https://kenney.nl/assets), [Quaternius](https://quaternius.com/), [Poly Pizza](https://poly.pizza/) and [Freesound](https://freesound.org/). Check each asset’s licence and attribution requirements before replacing the primitives.

References: [FSD](https://feature-sliced.design/docs/get-started/overview), [Three.js renderer](https://threejs.org/docs/pages/WebGLRenderer), [Vite setup](https://vite.dev/guide/).
