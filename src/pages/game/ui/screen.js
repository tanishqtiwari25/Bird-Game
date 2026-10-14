const birdIcon = `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m5 13 14 7 16-9-13 21-3-7-8-1z" fill="currentColor"/><path d="m19 20 3 12" stroke="currentColor" stroke-width="2"/></svg>`;
const soundIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/></svg>`;
const settingsIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z"/><circle cx="12" cy="12" r="3"/></svg>`;
const pauseIcon = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`;

export function createScreen(root) {
  root.innerHTML = `
    <main class="flight-shell" data-mode="home">
      <div id="scene" aria-label="3D flight world"></div>
      <div class="scene-shade"></div>
      <header class="topbar">
        <a class="brand" href="#" aria-label="Skybound home">${birdIcon}<span>skybound<span class="brand-dot">.</span></span></a>
        <div class="edition"><span class="live-dot"></span> A SMALL ESCAPE. A BIG ADVENTURE.</div>
        <div class="top-actions">
          <span class="phase-tag">3D FLIGHT · VOL. 01</span>
          <button id="sound-btn" class="icon-button" aria-label="Toggle sound" aria-pressed="true">${soundIcon}</button>
          <button id="settings-btn" class="icon-button" aria-label="Open settings">${settingsIcon}</button>
          <button id="pause-btn" class="icon-button play-only" aria-label="Pause flight">${pauseIcon}</button>
        </div>
      </header>

      <section id="home" class="home-panel">
        <div class="eyebrow"><span></span> LET YOUR CURIOSITY TAKE FLIGHT</div>
        <h1>A little bird.<br>A limitless <em>sky.</em></h1>
        <p>Leave the ground behind. Glide through floating<br class="desktop-break"> islands, chase golden trails, and find your flow.</p>
        <button id="play-btn" class="primary-button">Let’s fly <span>↗</span></button>
        <div class="home-controls"><span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span><span>or arrows to steer <b>·</b> Space to boost</span></div>
        <div class="touch-hint">Drag to steer · Hold boost to soar</div>
        <div class="home-stats"><div><span>PERSONAL BEST</span><strong id="home-best">0 <small>pts</small></strong></div><div><span>YOUR COLLECTION</span><strong id="home-wallet">0 <small>coins</small></strong></div><div><span>FLIGHT STYLE</span><strong>Free spirit <small>↗</small></strong></div></div>
      </section>

      <div class="world-label home-only"><span class="coordinate">01 / THE FLOATING ISLES</span><span class="label-line"></span><strong>Somewhere above<br>the everyday.</strong></div>
      <section id="hud" class="hud play-only" aria-label="Flight statistics">
        <div class="score-block"><span>SCORE</span><strong id="score">0000</strong></div>
        <div class="hud-divider"></div>
        <div class="coin-block"><span class="coin-icon">✦</span><div><span>COINS</span><strong id="coins">0</strong></div></div>
        <div class="hud-divider"></div>
        <div class="level-block"><span id="level">LEVEL 01</span><strong id="level-name">Sunlit Valley</strong></div>
      </section>
      <div id="level-toast" class="level-toast" role="status"><span>NEW HORIZONS</span><strong>Sunlit Valley</strong></div>
      <div id="notice" class="notice" role="status"></div>

      <div class="bottom-hud play-only">
        <section class="route-card">
          <div class="route-heading"><span class="tiny-bird">${birdIcon}</span><div><span>THE NEXT HORIZON</span><strong id="route-title">Explore Sunlit Valley</strong></div><span id="route-percent">0%</span></div>
          <div class="progress-track"><div id="level-fill"></div></div>
          <div class="route-footer"><span id="distance">0 m travelled</span><span id="next-level">Level 02 ↗</span></div>
        </section>
        <div class="combo-card"><span id="combo">×1</span><div><strong>COIN COMBO</strong><div class="combo-track"><div id="combo-fill"></div></div></div></div>
        <div class="boost-card"><button id="boost-btn" aria-label="Hold to boost">↗ <span>BOOST</span><kbd>SPACE</kbd></button><div class="boost-track"><div id="boost-fill"></div></div></div>
      </div>
      <div id="joystick" class="joystick play-only" aria-label="Drag joystick to steer"><div class="stick"></div></div>
      <footer class="home-footer home-only"><span><span class="live-dot"></span> NO RUSH. JUST A LITTLE WONDER.</span><span>Made for the joy of flying <span class="footer-spark">✧</span></span></footer>
      <div class="flight-guide play-only"><span>WASD / ARROWS <b>Steer</b></span><span>SPACE <b>Boost</b></span><span>ESC <b>Pause</b></span></div>

      <dialog id="pause-dialog" class="glass-dialog">
        <span class="eyebrow">A MOMENT IN THE CLOUDS</span><h2>Catch your breath.</h2><p>Your sky will be right here.</p>
        <button id="resume-btn" class="primary-button">Keep flying <span>↗</span></button>
        <div class="dialog-row"><button id="restart-btn" class="secondary-button">Fresh start</button><button id="finish-btn" class="secondary-button">Finish flight</button></div>
      </dialog>
      <dialog id="settings-dialog" class="glass-dialog">
        <div class="dialog-heading"><span class="eyebrow">MAKE IT YOUR SKY</span><button id="close-settings" class="icon-button" aria-label="Close settings">×</button></div>
        <h2>Flight preferences.</h2>
        <label class="setting-row"><span><strong>Sound effects</strong><small>A little chime for every find</small></span><input id="sound-setting" type="checkbox"></label>
        <label class="setting-row"><span><strong>Reduced effects</strong><small>Less motion, no sparkles or haptics</small></span><input id="effects-setting" type="checkbox"></label>
        <div class="setting-row"><span><strong>Tilt steering</strong><small>Optional · mobile sensor required</small></span><button id="tilt-btn" class="secondary-button compact">Enable</button></div>
        <p class="settings-note">Progress stays on this device. Take a break whenever you like.</p>
      </dialog>
      <dialog id="summary-dialog" class="glass-dialog">
        <span class="eyebrow">ONE BEAUTIFUL LITTLE JOURNEY</span><h2>A sky well explored.</h2><p id="summary-caption">Every flight is a fresh perspective.</p>
        <div class="summary-stats"><div><span>SCORE</span><strong id="summary-score">0</strong></div><div><span>COINS</span><strong id="summary-coins">0</strong></div><div><span>DISTANCE</span><strong id="summary-distance">0 m</strong></div></div>
        <button id="again-btn" class="primary-button">Fly again <span>↗</span></button><button id="home-btn" class="secondary-button full">Back to the nest</button>
      </dialog>
      <div id="fatal" class="fatal" hidden><h2>This sky couldn’t open.</h2><p>Enable WebGL / hardware acceleration in your browser and reload.</p><button onclick="location.reload()" class="primary-button">Try again ↗</button></div>
    </main>`;
  return Object.fromEntries([...root.querySelectorAll('[id]')].map((element) => [element.id, element]));
}
