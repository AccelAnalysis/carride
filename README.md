# carride

Nightline Driver is a browser-based 3D first-person driving game built with Three.js.

## Project structure

```text
carride/
├── index.html          # Minimal page shell and game markup
├── styles/
│   └── game.css        # HUD, menus, responsive and touch styles
└── src/
    ├── config.js       # Shared gameplay constants and tuning values
    ├── input.js        # Keyboard and mobile touch controls
    ├── main.js         # Game state, physics orchestration and animation loop
    ├── traffic.js      # Traffic vehicles, recycling and collision checks
    ├── ui.js           # HUD, toast, damage flash and screen state
    └── world.js        # Three.js scene, cockpit, road, buildings and renderer
```

## Where to make changes

- **Driving feel / difficulty:** edit `src/config.js` and the driving update in `src/main.js`.
- **Road, cockpit, lighting, scenery:** edit `src/world.js`.
- **Traffic cars and collision behavior:** edit `src/traffic.js`.
- **Keyboard or phone controls:** edit `src/input.js`.
- **HUD behavior and game screens:** edit `src/ui.js`.
- **Visual styling:** edit `styles/game.css`.
- **Page structure:** edit `index.html`.

## Local development

The JavaScript now uses ES modules, so serve the repository through a local web server instead of opening `index.html` directly from `file://`.

For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Three.js is currently loaded as an ES module from jsDelivr, so the game still requires internet access unless that dependency is vendored locally.

## Hosting

The root `index.html` remains the entry point, so the project is compatible with GitHub Pages and other static hosts.
