# Conveyer x Surveyor-Sketch
> A high-end, AI-driven utility combining fluid workspace communication with high-density coordinate drafting.

---

## 🛠️ Project Specifications

### 1. Conveyer Core (AI Communication & Workspace Utility)
Conveyor is a dynamic, AI-administered interface module built to manage notes, ideas, and internet-augmented data retrieval.
* **Window Management:** Supports docking to specific screen regions and a variable translucency state for an unobtrusive background presence.
* **Volatile Notes:** A dedicated notepad feature featuring a visual dissolving text effect for temporary data entry.
* **AI Co-Pilot ("Sparking Ideas"):** Continuous analysis of active notes to suggest context-aware project ideas, alongside automated text summarization.
* **Fluid Architecture:** Capable of splitting into multiple independent notepad instances and seamlessly merging back into the root utility without data loss.
* **Data Retrieval:** Built-in web-scraping and API capability to fetch real-time internet data and map it directly to active project items.

### 2. Surveyor-Sketch Module (Drafting Engine)
Inherited and adapted from the ArithmaGen "Arithma-Sketch" core.
* **Drafting Canvas:** Powered by the HTML5 Canvas API, optimized for high-density field drafting, geometric precision, and sequential coordinate plotting.
* **Design Philosophy:** Strictly code-driven and geometric; completely rejects organic brushes or sprays in favor of absolute mathematical line-work.

### 3. Visual Aesthetic
* **Themes:** Full support for high-contrast Light Mode and Dark Mode.
* **UI Vibe:** High-end terminal aesthetic featuring clean geometric bounds and sharp contrast ratios.

---

## 🚀 Interface Commands & Controls

| Feature / Command | Description | Action / Trigger |
| :--- | :--- | :--- |
| **Dock Window** | Snaps the utility to a designated screen anchor. | `Window Action` |
| **Translucency Toggle**| Shifts interface to a semi-transparent layer. | `UI State Change` |
| **Dissolve Text** | Gradually fades out text within the volatile notepad. | `Notepad Feature` |
| **Spark Ideas** | Generates contextual suggestions from notes. | `AI Core Invocation` |
| **Summarize** | Compresses active logs or text blocks. | `AI Core Invocation` |
| **Split / Merge** | Spawns separate notepads or collapses them back. | `Data Stream Merge` |
| **Retrieve** | Fetches relevant internet data into project items. | `Network Fetch` |

---

## 📂 Directory Structure

conveyer-surveyor-workspace/
├── .agents/
│   └── skills/                # Local Antigravity agent instructions
├── src/
│   ├── core/
│   │   ├── stateManager.js    # The data bridge holding active text/coordinates
│   │   └── networkService.js  # Scoped outbound fetching (Secure Retrieve)
│   ├── conveyer/
│   │   ├── notepad.js         # Text handling, splitting/merging logic
│   │   └── aiCore.js          # Sparking ideas & summary hooks
│   ├── surveyor/
│   │   ├── canvasEngine.js    # HTML5 Canvas rendering & geometric line plotting
│   │   └── coordinateMath.js  # Surveying coordinate calculations
│   └── main.js                # App initialization and secure event loops
└── README.md                  # Project blueprint