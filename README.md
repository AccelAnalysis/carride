# carride

Nightline Driver is a browser-based 3D first-person driving game built with Three.js.

## Current gameplay

- Endless first-person highway driving
- Smooth left and right road curves with straight sections between bends
- Speed-sensitive curve drift that requires steering through the turn
- Traffic that follows the curved road centerline
- Vehicle-to-vehicle collision detection with relative-speed damage
- Collision shove, speed loss, traffic deflection, and collision cooldown
- Overtake and close-pass scoring
- Keyboard and mobile touch controls

## Project structure

```text
carride/
├── index.html          # Minimal page shell and game markup
├── styles/
│   └── game.css        # HUD, menus, responsive and touch styles
└── src/
    ├── config.js       # Shared gameplay constants and tuning values
    ├── input.js        # Keyboard and mobile touch controls
    ├── main.js         # Game state, handling, physics and animation loop
    ├── road.js         # Shared curved-road centerline geometry
    ├── traffic.js      # Traffic vehicles, curved paths and collisions
    ├── ui.js           # HUD, toast, damage flash and screen state
    └── world.js        # Three.js scene, cockpit, road, buildings and renderer
```

## Where to make changes

- **Driving feel / difficulty:** edit `src/config.js` and the driving update in `src/main.js`.
- **Curve geometry:** edit `src/road.js` and curve tuning in `src/config.js`.
- **Road, cockpit, lighting, scenery:** edit `src/world.js`.
- **Traffic cars and collision behavior:** edit `src/traffic.js`.
- **Keyboard or phone controls:** edit `src/input.js`.
- **HUD behavior and game screens:** edit `src/ui.js`.
- **Visual styling:** edit `styles/game.css`.
- **Page structure:** edit `index.html`.

## Local development

The JavaScript uses ES modules, so serve the repository through a local web server instead of opening `index.html` directly from `file://`.

For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Three.js is currently loaded as an ES module from jsDelivr, so the game still requires internet access unless that dependency is vendored locally.

## Hosting

The root `index.html` remains the entry point, so the project is compatible with GitHub Pages and other static hosts.
