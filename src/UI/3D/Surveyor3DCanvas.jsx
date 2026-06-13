/**
 * Surveyor-3D Canvas Root Component
 * Sets up the React Three Fiber Canvas with lighting, camera options, and OrbitControls.
 * Intelligently switches between flat surveying coordinates (CoordinateSpace3D) and
 * the active travel spline (Tunnel3D) based on morphing lifecycle states.
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CoordinateSpace3D } from './CoordinateSpace3D.jsx';
import { Tunnel3D } from './Tunnel3D.jsx';
import { use3DMorphState } from './hooks.js';

export function Surveyor3DCanvas() {
    const { active: morphActive } = use3DMorphState();

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a0f' }}>
            <Canvas shadows>
                {/* 1. Interactive Orbit Camera Setup */}
                <PerspectiveCamera makeDefault position={[30, 40, 50]} fov={50} />
                <OrbitControls 
                    enableDamping 
                    dampingFactor={0.05}
                    maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from clipping through floor
                    minDistance={5}
                    maxDistance={150}
                />

                {/* 2. Scenic Lighting Matrix */}
                <color attach="background" args={['#050508']} />
                <fog attach="fog" args={['#050508', 30, 150]} />

                <ambientLight intensity={0.15} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                {/* Main Directional Sun */}
                <directionalLight 
                    position={[20, 50, 20]} 
                    intensity={1.2} 
                    castShadow 
                    shadow-mapSize={[2048, 2048]}
                />

                {/* 3. Logical Geometry Layers */}
                <Suspense fallback={null}>
                    {/* Render the 3D Tunnel Spline when Morph sequence is active */}
                    {morphActive ? (
                        <Tunnel3D />
                    ) : (
                        <CoordinateSpace3D />
                    )}
                </Suspense>
            </Canvas>

            {/* Floating on-screen 3D HUD diagnostics */}
            <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(5, 5, 10, 0.85)',
                border: '1px solid #00ffcc',
                borderRadius: '6px',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#fff',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                maxWidth: '220px'
            }}>
                <div style={{ color: '#00ffcc', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '6px' }}>
                    🛰️ SURVEYOR-3D VIEW
                </div>
                <div>Status: <span style={{ color: morphActive ? '#82ff6f' : '#00ffcc' }}>{morphActive ? "CORRIDOR ACTIVE" : "DRAFTING FIELD"}</span></div>
                <div>System: <span style={{ color: '#82ff6f' }}>R3F + Three.js</span></div>
                <div style={{ fontSize: '10px', color: '#888', marginTop: '6px' }}>
                    * Left-Click + Drag to Orbit<br/>
                    * Right-Click + Drag to Pan<br/>
                    * Scroll to Zoom
                </div>
            </div>
        </div>
    );
}

export default Surveyor3DCanvas;
