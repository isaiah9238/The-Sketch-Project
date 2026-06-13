/**
 * Surveyor-3D Tunnel Segment Component
 * Translates the 2D coordinate-based funnel layout into a winding,
 * three-dimensional spatial tunnel (a smooth tube spline) that characters can travel through.
 */

import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { use3DCoordinates, use3DMorphState } from './hooks.js';

export function Tunnel3D() {
    const points3D = use3DCoordinates(5.0); // Procedural elevation spacing to spiral upward!
    const { active: morphActive, fraction: morphFraction } = use3DMorphState();
    
    /** @type {React.MutableRefObject<any>} */
    const travelerRef = useRef(null);
    const [travelProgress, setTravelProgress] = useState(0);

    // 1. Generate the smooth 3D mathematical spline (CatmullRomCurve3) representing the channel path
    const splineCurve = useMemo(() => {
        if (points3D.length < 2) return null;
        
        const threePoints = points3D.map(p => new THREE.Vector3(p.x, p.y, p.z));
        
        // If we want a smooth continuous loop, or just a sequential corridor:
        return new THREE.CatmullRomCurve3(threePoints, false, 'catmullrom', 0.5);
    }, [points3D]);

    // 2. Animate the traveler sliding down the 3D Spline
    useFrame((/** @type {any} */ state, /** @type {number} */ delta) => {
        if (!splineCurve) return;

        // Progress travelers if the morph sequence is fully complete, or continuously for demo
        let speedFactor = 0.05; // speed multiplier
        let nextProgress = travelProgress + delta * speedFactor;
        if (nextProgress > 1.0) nextProgress = 0; // Loop back
        setTravelProgress(nextProgress);

        if (travelerRef.current) {
            // Get position and tangent vectors along the spline path
            const positionAtProgress = splineCurve.getPointAt(nextProgress);
            const tangentAtProgress = splineCurve.getTangentAt(nextProgress);

            travelerRef.current.position.copy(positionAtProgress);
            
            // Align traveler's forward vector (-Z) with spline tangent direction
            const targetLook = positionAtProgress.clone().add(tangentAtProgress);
            travelerRef.current.lookAt(targetLook);
        }
    });

    if (!splineCurve) return null;

    return (
        <group>
            {/* 1. Spline Corridor Wall (glowing, semi-transparent tube) */}
            <mesh castShadow receiveShadow>
                <tubeGeometry args={[splineCurve, 64, 4.0, 16, false]} />
                <meshStandardMaterial 
                    color="#0066aa" 
                    emissive="#001a33"
                    wireframe={true} // Neon grid lines style
                    transparent={true}
                    opacity={0.3 + (morphFraction * 0.4)} // Brighten as morph completes!
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Solid inner core ring emitters (ribs spaced along the tunnel) */}
            {Array.from({ length: 12 }).map((_, i) => {
                const t = i / 11;
                const pt = splineCurve.getPointAt(t);
                const tangent = splineCurve.getTangentAt(t);
                const lookAtTarget = pt.clone().add(tangent);

                return (
                    <group key={`rib-${i}`} position={pt}>
                        <mesh 
                            ref={(/** @type {any} */ el) => {
                                if (el) el.lookAt(lookAtTarget);
                            }}
                        >
                            <torusGeometry args={[3.9, 0.08, 8, 32]} />
                            <meshBasicMaterial 
                                color={morphActive ? "#82ff6f" : "#00ffcc"} 
                                transparent 
                                opacity={0.6} 
                            />
                        </mesh>
                    </group>
                );
            })}

            {/* 2. Integrated "Traveler" Mesh (Field Book + Notepad companion combined node) */}
            <group ref={travelerRef}>
                {/* Visual mesh representing the traveling duo */}
                <group scale={[0.8, 0.8, 0.8]}>
                    {/* The Field Book (green rectangular prism) */}
                    <mesh position={[-0.6, 0, 0]} castShadow>
                        <boxGeometry args={[0.8, 1.2, 0.3]} />
                        <meshStandardMaterial 
                            color="#2da44e" 
                            emissive="#123d1d" 
                            roughness={0.2}
                        />
                    </mesh>

                    {/* The Notepad companion (yellow cylindrical prism) */}
                    <mesh position={[0.6, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.3, 0.3, 1.0, 16]} />
                        <meshStandardMaterial 
                            color="#cca700" 
                            emissive="#4f4100" 
                            roughness={0.3}
                        />
                    </mesh>

                    {/* Glowing energy bridge between them */}
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    
                    {/* Tiny trailing engine flare */}
                    <mesh position={[0, 0, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.2, 0.6, 16]} />
                        <meshBasicMaterial color="#ff7700" />
                    </mesh>
                </group>

                {/* Companion Dialogue / Coordinate Overlay */}
                <Html distanceFactor={12} position={[0, 1.5, 0]}>
                    <div style={{
                        background: 'rgba(10, 10, 10, 0.95)',
                        border: '1px solid #00ffcc',
                        color: '#00ffcc',
                        padding: '4px 8px',
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 0 10px rgba(0, 255, 204, 0.3)',
                        pointerEvents: 'none',
                        textAlign: 'center'
                    }}>
                        <strong>DUO TRAVELER</strong><br/>
                        Pos: {travelProgress.toFixed(2)}<br/>
                        <span style={{ color: '#fff' }}>"Through the Math corridor!"</span>
                    </div>
                </Html>
            </group>
        </group>
    );
}

export default Tunnel3D;
