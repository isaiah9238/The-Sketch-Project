# GEMINI.md - The Sketch Project Instructions & Memory Ledger

Welcome! This document serves as the **foundational instructions, workspace conventions, and architecture blueprint** for any developer or AI assistant (such as the All-Around Assistant) contributing to **The Sketch Project**.

---

## 🛰️ Project Overview
**The Sketch Project** is a high-end web utility combining:
1. **Fluid Workspace Communication:** Real-time chat dialogue and companion interactions (featuring the "Field Book" and "Notepad" personas powered by Gemini AI).
2. **High-Density Coordinate Drafting:** 2D geometric land surveying coordinate calculations and boundary plot tracing.
3. **3D Spatial Visualization:** A side-by-side Three.js and React Three Fiber rendering corridor mapping the 2D survey drafting in real-time.

---

## 📁 Architectural Layout & Folder Structure

```
The Sketch Project/
├── index.html                 # Entry DOM container with side-by-side visualizer slots
├── package.json               # Bundler settings & package registry
├── mcp_config.json            # Model Context Protocol filesystem settings
├── blueprint.md               # Project-wide narrative roadmaps and milestones
├── tsconfig.json              # TypeScript compiler settings for JSDoc type checking
├── functions/                 # Backend Cloud Functions codebase
└── src/
    ├── main.js                # Core app entry point (boots layout, Firebase, conversation, and 3D)
    ├── turningFile.js         # Unified entry point for reactive core globalState & StateStore
    ├── ai/                    # Gemini API wrappers & conversation engines
    │   ├── geminiClient.js
    │   └── conversationEngine.js
    ├── auth/                  # Firebase authentication modules (Google Auth)
    │   └── authService.js
    ├── core/                  # Core state and math operations
    │   ├── stateManager.js    # Reactive global proxy state tree
    │   ├── networkService.js
    │   └── math/
    │       └── interpolation.js
    ├── entities/              # Core business logic entities
    │   ├── conveyer_2/        # AI Core text parsing & manual azimuth/distance tokenization
    │   │   └── aiCore.js
    │   └── fieldbook/         # Canvas graphics loop & 2D coordinate calculus
    │       ├── canvasEngine.js
    │       └── coordinateMath.js
    ├── libs/                  # Third-party SDK initializations (Firebase client)
    │   └── firebase-init.js
    ├── sequences/             # Narrative interpolation and morph transitions
    │   └── tunnel/
    │       ├── morphEngine.js
    │       └── tunnelDraw.js
    └── UI/
        ├── styles/            # Theme styling, CSS variables, and layout properties
        │   └── styles.css
        └── 3D/                # React Three Fiber 3D spatial visualizer codebase
            ├── hooks.js               # Mathematical 2D -> 3D mapping and React Hooks
            ├── CoordinateSpace3D.jsx  # High-contrast 3D plot boundary and node indicators
            ├── Tunnel3D.jsx           # Glowing CatmullRomCurve3 spline tube and traveler duo
            ├── Surveyor3DCanvas.jsx   # R3F Root Scene, lights, fog, camera, and OrbitControls
            └── mount3D.js             # React DOM root mounting bridge for main.js
```

---

## 🛡️ Workspace Conventions & Development Guidelines

1. **Strict JSDoc Type System (No `.ts` files):**
   * Keep files lightweight as native ES module JavaScript (`.js` and `.jsx`).
   * Enforce type checking via `tsc --noEmit`. All files **must** have comprehensive JSDoc type annotations.
   * Avoid `any` types. Type-annotate arrays and callback parameters explicitly (e.g., `/** @type {any} */` inside JSX maps and `useFrame` updates) to maintain strict compiler compliance.

2. **State Management Protocol:**
   * Direct mutations are managed securely via `globalState` (a reactive `Proxy` around `StateStore` in `src/core/stateManager.js`, exported by `src/turningFile.js`).
   * Subscribers (such as the Canvas Engine) listen to changes on `stateManager.subscribe()` to trigger visual re-renders.

3. **Coordinate System Mapping (2D to 3D):**
   * To bridge surveying geometry into three-dimensional space, the following coordinate matrix is applied:
     $$X_{3D} = x_{2D} \quad (\text{Easting})$$
     $$Z_{3D} = -y_{2D} \quad (\text{Northing, depth inverted for Three.js alignment})$$
     $$Y_{3D} = \text{Elevation Factor} \quad (\text{Procedural vertical spacing for spiral crawls})$$
   * Centroids and azimuths are solved natively in 2D and then dynamically mapped to 3D via `src/UI/3D/hooks.js`.

4. **Vite JSX Parsing:**
   * Vite compiles JSX (`.jsx`) out-of-the-box. Ensure your `tsconfig.json` contains `"jsx": "react-jsx"` under `compilerOptions` so that compiler checkers can parse JSX elements without error.

---

## 🌌 Core Features Developed (As of June 13, 2026)

* **AI Structured Vector Parser:**
  `aiCore.js` processes freeform text via Gemini or manual token falling to extract geodetic traverses (e.g. `AZ 90 DIST 50`) and push them to Firebase.
* **Side-by-Side 2D/3D Drafting Viewports:**
  The workspace divides the screen cleanly (50/50 flex flexbox) to mount the 2D canvas grid and the R3F interactive 3D Orbit view side-by-side.
* **The Math Spline Tunnel Corridor:**
  When a "Morph" sequence is triggered, the drafting boundary coordinates smoothly interpolate into a perfect circle. In 3D, a `TubeGeometry` forms a winding spline tunnel through which the combined Duo Traveler (Field Book + Notepad companion) travels with sliding engine flares.
* **MCP Integration:**
  A local `mcp_config.json` filesystem server endpoint is configured for secure IDE file-tool bindings.
