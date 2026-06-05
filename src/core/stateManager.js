/*
# Antigravity Task Boundaries & Work Process

## 1. Retrieval & Correction Loop
- ** Step 1:** Human initiates a project segment task.
- ** Step 2:** Agent requests specific files and components.
- ** Step 3:** Human provides / approves code segment access.
- ** Step 4:** Agent reviews logic, drafts an execution plan, and writes corrections to an isolated Artifact.
- ** Step 5:** Changes are committed to the local workspace only after Human approval.

## 2. Protected Files
- Do NOT alter core firebase / gcloud config files without an explicit manual checkpoint.
- Keep all major application state variables locked inside the designated `stateManager` files.

# Developer Momentum Log

| Date | Target Project | Allocated Time Block | Micro - Deploys Triggered | Focus Target |
| : --- | : --- | : --- | : --- | : --- |
| 2026-06-04 | Core_App | 45 Mins | 2 | Auth configuration check |
| 2026-06-05 | UI_Refresh | 60 Mins | 0 | Layout adjustments & artifact review |
*/

/**
 * Conveyer x Surveyor-Sketch State Manager
 * Acts as the central nervous system bridging data between text notes and coordinate drafts.
 */

export const globalState = {
    notes: [],
    coordinates: [],
    parcels: []
};