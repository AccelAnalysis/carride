# carride

Nightline Driver is a browser-based 3D first-person driving game built with Three.js and designed to run as a static site, including GitHub Pages.

## Tracks

The game now has three finite, replayable tracks with distinct curve sequences, scenery, traffic behavior, and difficulty:

- **Metro Midnight** — 1.8 mi, dense neon-city traffic and technical bends.
- **Coastal Rush** — 2.2 mi, faster sweepers, lighter traffic, and a sunrise-coast environment.
- **Alpine Switchback** — 2.0 mi, tight switchbacks, mountain scenery, and more aggressive traffic.

## Gameplay

- First-person cockpit driving with speed-sensitive camera FOV
- Track progress, run timer, checkpoints, finish line, and persistent best times
- Smooth deterministic curves unique to each track
- Traffic that follows the road, changes lanes, and scales with race progress
- Vehicle-to-vehicle collision detection with relative-speed damage and impact shake
- Overtake and close-pass scoring with a clean-driving combo multiplier
- Slipstream drafting that accelerates boost recharge
- Rechargeable boost system with dedicated HUD meter
- Off-road speed loss, damage, and reduced control
- Pause/resume support
- Lightweight synthesized engine, reward, impact, and finish sounds
- Keyboard and mobile touch controls
- Responsive HUD and track-selection interface

## Controls

- **W / Up Arrow** — accelerate
- **S / Down Arrow** — brake
- **A / D or Left / Right Arrow** — steer
- **Shift** — boost
- **P or Escape** — pause/resume
- **M** — mute/unmute audio
- Mobile devices use the on-screen steering, gas, brake, and boost controls.

## Project structure

```text
carride/
├── index.html          # Page shell, track selection, HUD and result screens
├── styles/
│   └── game.css        # HUD, menus, responsive and touch styles
└── src/
    ├── audio.js        # Lightweight Web Audio engine and game cues
    ├── config.js       # Shared gameplay constants and tuning values
    ├── input.js        # Keyboard and mobile touch controls
    ├── main.js         # Race state, handling, scoring and animation loop
    ├── road.js         # Shared curved-road centerline geometry
    ├── tracks.js       # Track definitions, curve sequences and themes
    ├── traffic.js      # Traffic AI, drafting, collisions and lane changes
    ├── ui.js           # HUD, menus, results, toast and damage feedback
    └── world.js        # Three.js scene, cockpit and track environments
```

## Local development

The JavaScript uses ES modules, so serve the repository through a local web server instead of opening `index.html` directly from `file://`.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Three.js is loaded as an ES module from jsDelivr, so the game requires internet access unless that dependency is vendored locally.

## Hosting

The root `index.html` remains the entry point, so the project is compatible with GitHub Pages and other static hosts.
