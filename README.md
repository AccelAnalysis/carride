# carride

Nightline Driver is a browser-based 3D first-person driving game built with Three.js and designed to run as a static site, including GitHub Pages.

## Tracks

The game includes 12 replayable routes. Each track has a deterministic procedural road seed, so the course layout stays consistent while the weather challenge escalates.

- **Metro Midnight** — 1.8 mi neon downtown course.
- **Coastal Rush** — 2.2 mi sunrise coastal sweepers.
- **Alpine Switchback** — 2.0 mi technical mountain route.
- **Desert Interstate** — 18.0 mi long-haul desert highway.
- **Snowy Mountain Highway** — 12.0 mi icy mountain endurance route.
- **Rural Country Road** — 10.0 mi farm and countryside drive.
- **Tropical Island** — 9.0 mi palm-lined island route.
- **Dense City** — 8.0 mi traffic-heavy technical city course.
- **European Mountain Road** — 11.0 mi tight alpine-style road.
- **Racetrack** — 5.0 mi high-speed circuit environment.
- **Post-Apocalyptic Highway** — 20.0 mi ruined-world endurance highway.
- **Futuristic Neon City** — 14.0 mi luminous cyber-city route.

## Procedural and streaming world

Road curvature is generated from deterministic per-track seeds instead of a fixed list of authored curve sections. The same selected track therefore generates the same road sequence on replay.

The visible road and roadside environment are organized into reusable world chunks. Chunks are recycled behind the player and repopulated ahead, allowing tracks to become much longer without linearly increasing the number of active road meshes and scenery objects.

Streamed scenery includes environment-specific props plus roadside businesses:

- Gas stations
- Restaurants
- Garages
- Motels

## Weather challenge

Each track has four weather challenge stages. Completing a course and choosing **Next Weather Challenge** replays the same procedural course with more severe conditions.

Weather can change:

- Visibility and fog density
- Tire grip
- Braking effectiveness
- Curve drift
- Crosswind
- Rain, snow, dust, ash, mist, or storm particle effects depending on the route climate

Examples include desert sandstorms, snowy whiteouts, tropical storms, heavy urban rain, and wasteland ash storms.

## Gameplay

- First-person cockpit driving with speed-sensitive camera FOV
- Track progress, run timer, checkpoints, finish line, and persistent best times
- Deterministic procedural road generation
- Streaming road/environment chunks for long routes
- Traffic that follows the road, changes lanes, and scales with race progress
- Vehicle-to-vehicle collision detection with relative-speed damage and impact shake
- Overtake and close-pass scoring with a clean-driving combo multiplier
- Slipstream drafting that accelerates boost recharge
- Rechargeable boost system with dedicated HUD meter
- Off-road speed loss, damage, and reduced control
- Four-stage weather challenge progression
- Roadside businesses and themed scenery
- Pause/resume support
- Lightweight synthesized engine, reward, impact, and finish sounds
- Keyboard, touch, and phone tilt steering
- Responsive HUD and track-selection interface

## Controls

- **W / Up Arrow** — accelerate
- **S / Down Arrow** — brake
- **A / D or Left / Right Arrow** — steer
- **Shift** — boost
- **P or Escape** — pause/resume
- **M** — mute/unmute audio
- **Mobile touch** — steering, gas, brake, and boost controls
- **Enable Tilt Steering** — on supported phones/tablets, grants motion permission and uses device tilt for steering; touch or keyboard steering overrides tilt input

On iOS, device-orientation permission must be requested from a user gesture, so tilt steering is enabled from the start-screen button.

## Project structure

```text
carride/
├── index.html               # Page shell, HUD, menus and result screens
├── styles/
│   └── game.css             # HUD, menus, responsive and touch styles
└── src/
    ├── audio.js             # Lightweight Web Audio engine and game cues
    ├── config.js            # Shared gameplay constants and tuning values
    ├── input.js             # Keyboard, touch and phone-tilt controls
    ├── main.js              # Race state, weather progression, scoring and loop
    ├── proceduralRoad.js    # Seeded procedural road-section generator
    ├── road.js              # Curved-road centerline math
    ├── tracks.js            # 12 track definitions, seeds, climates and themes
    ├── traffic.js           # Traffic AI, drafting, collisions and lane changes
    ├── ui.js                # Dynamic track picker, HUD, results and feedback
    ├── weather.js           # Four-stage climate/weather system and particles
    ├── world.js             # Three.js scene, cockpit, camera and world integration
    └── worldChunks.js       # Recycled road/scenery chunks and roadside businesses
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
