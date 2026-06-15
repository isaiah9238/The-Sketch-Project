---
name: survey-tunnel-companion
description: Guides the agent on how to manage, render, and manipulate the 3D Spline Tunnel and the Gemini Conversation AI Chat Companions. Use when working on 3D scene geometry, Catmull-Rom spline curves, the Duo Traveler animation, or the Field Book and Notepad chat personas.
---

# Survey Tunnel Companion Skill Guide

This skill provides expert procedural guidance, mathematical specifications, and workflow patterns for managing, extending, and testing the 3D Spline Tunnel corridor and the Gemini AI Chat Companion personas inside **The Sketch Project**.

---

## 🗺️ Architectural Mapping Reference

Any agent or developer working on the 3D Tunnel or Conversation subsystems must adhere strictly to this folder and file hierarchy:
* **`src/UI/3D/`**: The React Three Fiber (R3F) 3D coordinate space rendering.
  * `hooks.js`: Coordinates 2D-to-3D vector calculus.
  * `Surveyor3DCanvas.jsx`: Sets up the `<Canvas>` and `<OrbitControls>`.
  * `CoordinateSpace3D.jsx`: Draws flat survey plots, vertices, and centroids.
  * `Tunnel3D.jsx`: Constructs the winding spline tube, ring ribs, and traveling Duo mesh.
  * `mount3D.js`: Vanilla mounting bridge.
* **`src/ai/`**: Gemini API integration and conversation engine.
  * `geminiClient.js`: Unified API singleton.
  * `conversationEngine.js`: Character prompts, persona configurations, and chat logs.
* **`src/sequences/tunnel/`**: 2D morph and funnel geometry generators.
  * `morphEngine.js`: Linear shape interpolation.
  * `tunnelDraw.js`: Sequential funnel vertex generation.

---

## 📐 1. The 3D Spline Tunnel Mathematics

The 3D Spline Tunnel maps a discrete list of 2D land surveying coordinates $\{x, y\}$ into a smooth, continuous three-dimensional trajectory.

### Coordinate Space Translation
* **Easting ($X_{3D}$):** Direct $1.0$ scale projection of 2D $X$.
* **Northing ($Z_{3D}$):** Inverted $-1.0$ scale projection of 2D $Y$ (matching WebGL forward depth conventions).
* **Procedural Elevation ($Y_{3D}$):** Calculated as a helical staircase or winding spiral path using the point's index $i$ inside the coordinate array:
  $$Y_{i} = \text{index}_i \times \text{elevationStep} \times \text{elevationFactor}$$

### Spline Curve Generation (Three.js)
The spline path is constructed inside `Tunnel3D.jsx` using `THREE.CatmullRomCurve3` with Catmull-Rom interpolation:
```javascript
const splineCurve = useMemo(() => {
    if (points3D.length < 2) return null;
    const threePoints = points3D.map(p => new THREE.Vector3(p.x, p.y, p.z));
    return new THREE.CatmullRomCurve3(threePoints, false, 'catmullrom', 0.5);
}, [points3D]);
```

### Animating the Duo Traveler
To simulate smooth travel down the math corridor, the traveler mesh is updated inside the `useFrame` render loop:
1. **Positioning:** Query the curve position at the current progress $t \in [0, 1]$ using `.getPointAt(t)`.
2. **Alignment:** Query the curve tangent (direction vector) at progress $t$ using `.getTangentAt(t)`. Look at a target position slightly ahead:
   $$\vec{T}_{\text{target}} = \vec{P}(t) + \vec{D}_{\text{tangent}}(t)$$
```javascript
useFrame((state, delta) => {
    if (!splineCurve) return;
    let nextProgress = (travelProgress + delta * speedFactor) % 1.0;
    setTravelProgress(nextProgress);

    if (travelerRef.current) {
        const position = splineCurve.getPointAt(nextProgress);
        const tangent = splineCurve.getTangentAt(nextProgress);
        travelerRef.current.position.copy(position);
        travelerRef.current.lookAt(position.clone().add(tangent));
    }
});
```

---

## 🧠 2. The Gemini Chat Companion Subsystem

The Notepad and Field Book companion characters communicate using the unified `@google/genai` (Gemini Developer API) client located in `src/ai/geminiClient.js`.

### Personas in `conversationEngine.js`
* **Field Book:** Pragmatic, exact, detail-oriented land surveyor who thinks in coordinates, vectors, angles, and distances.
* **Notepad:** Highly encouraging, communicative, and creative traveling partner who prompts the Field Book to explore new horizons.

### Conversation Flow
1. Chat logs are maintained reactively in `globalState.conversation`.
2. When the user writes geodetic commands or notes, the `autoSpark` trigger evaluates if a character response is appropriate and fires a background prompt to Gemini.

---

## 🚀 3. Extension & Integration Workflows

### How to Trigger the 3D Spline Tunnel Morph via Chat
If the user wants a chat command to trigger a spatial tunnel morph (e.g. *"Duo, let's travel through the tunnel!"*), the agent must:
1. Intercept the text inside `aiCore.js` or `conversationEngine.js`.
2. Trigger the 2D canvas morph:
   ```javascript
   // @ts-ignore
   if (window.currentCanvasEngine) {
       window.currentCanvasEngine.startMorph(2500, targetVertices);
   }
   ```
3. Update `globalState.coordinates` with the target funnel coordinates (`generateFunnelVertices()`). This automatically triggers the `use3DMorphState` hook in R3F, transitioning the 3D scene smoothly into the winding Spline Corridor.

### Developing and Modifying 3D Components
* **Rule 1:** Always write plain JS/JSX files (`.jsx`).
* **Rule 2:** Ensure type safety using JSDoc.
* **Rule 3:** Do not leave un-initialized `useRef` calls. Always pass `null` as the default value (e.g., `useRef(null)`) to prevent TypeScript compilation errors under React 19 typings.
* **Rule 4:** Trigger `window.dispatchEvent(new Event('resize'))` in a short timeout whenever resizing the Picture-in-Picture (PiP) window. This guarantees that Three.js recalculates the camera aspect ratios cleanly.
