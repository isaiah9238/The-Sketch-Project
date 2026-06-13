/**
 * Surveyor-3D Coordinate Space Component
 * Renders the 2D survey drafting data as high-fidelity 3D spatial geometry,
 * complete with vertices, neon boundary lines, centroid indicators, and active morphing sequences.
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { use3DCoordinates, use3DCentroid, use3DMorphState, COORDINATE_CONFIG_3D } from './hooks.js';
import { lerp } from '../../core/math/interpolation.js';

/**
 * @typedef {import('./hooks.js').Vector3D} Vector3D
 */

export function CoordinateSpace3D() {
    // 1. Fetch reactive 3D coordinates (with a slight vertical spiral spiral)
    const points3D = use3DCoordinates(0.1); // 0.1 elevation scale for depth tracing
    const centroid3D = use3DCentroid();
    const { active: morphActive, fraction: morphFraction, targetPoints3D } = use3DMorphState();

    const lineRef = useRef(null);

    // 2. Compute the active geometry, accounting for active morph interpolation
    const activePoints = useMemo(() => {
        if (!points3D || points3D.length === 0) return [];
        if (!morphActive || targetPoints3D.length === 0) return points3D;

        const morphed = [];
        const length = points3D.length;
        
        for (let i = 0; i < length; i++) {
            const start = points3D[i];
            const end = targetPoints3D[i % targetPoints3D.length];
            morphed.push(new THREE.Vector3(
                lerp(start.x, end.x, morphFraction),
                lerp(start.y, end.y, morphFraction),
                lerp(start.z, end.z, morphFraction)
            ));
        }
        return morphed;
    }, [points3D, morphActive, morphFraction, targetPoints3D]);

    // Format the path vertices for Drei Line component (which expects Three.Vector3 arrays)
    const linePoints = useMemo(() => {
        if (activePoints.length === 0) return [];
        const vec3s = activePoints.map((/** @type {any} */ p) => 
            p instanceof THREE.Vector3 ? p : new THREE.Vector3(p.x, p.y, p.z)
        );
        // If it's a closed loop, append the start point to close the visual track
        if (vec3s.length > 2) {
            vec3s.push(vec3s[0].clone());
        }
        return vec3s;
    }, [activePoints]);

    return (
        <group>
            {/* Ambient & Directional Lights focused on coordinates */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

            {/* 1. Neon Emerald Plot Boundary */}
            {linePoints.length > 0 && (
                <Line
                    ref={lineRef}
                    points={linePoints}
                    color="#82ff6f"
                    lineWidth={3}
                    dashed={false}
                />
            )}

            {/* 2. Vertices (3D Node Spheres) */}
            {activePoints.map((/** @type {any} */ pt, /** @type {number} */ idx) => {
                const pos = pt instanceof THREE.Vector3 ? pt : new THREE.Vector3(pt.x, pt.y, pt.z);
                return (
                    <group key={`node-${idx}`} position={pos}>
                        {/* High-visibility node */}
                        <mesh castShadow receiveShadow>
                            <sphereGeometry args={[0.6, 16, 16]} />
                            <meshStandardMaterial 
                                color="#82ff6f" 
                                emissive="#23c834"
                                emissiveIntensity={0.5}
                                roughness={0.1} 
                            />
                        </mesh>
                        
                        {/* Vertex Diagnostic HUD Overlay */}
                        <Html distanceFactor={15} position={[0, 1.2, 0]}>
                            <div style={{
                                background: '#111111e0',
                                border: '1px solid #82ff6f',
                                color: '#82ff6f',
                                padding: '2px 6px',
                                fontFamily: 'monospace',
                                fontSize: '10px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none'
                            }}>
                                Pt {idx}: {pos.x.toFixed(1)}, {pos.z.toFixed(1)}
                            </div>
                        </Html>
                    </group>
                );
            })}

            {/* 3. Centroid Marker and Geometric Hub */}
            {points3D.length >= 3 && (
                <group position={[centroid3D.x, centroid3D.y, centroid3D.z]}>
                    {/* Centroid Ring */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[1.5, 1.8, 32]} />
                        <meshBasicMaterial color="#00ffcc" side={THREE.DoubleSide} />
                    </mesh>
                    
                    {/* Centroid Spindle Sphere */}
                    <mesh position={[0, 0.5, 0]}>
                        <sphereGeometry args={[0.4, 8, 8]} />
                        <meshStandardMaterial 
                            color="#00ffcc" 
                            emissive="#0099aa" 
                            roughness={0.2} 
                        />
                    </mesh>

                    {/* Centroid text */}
                    <Html distanceFactor={20} position={[0, -1.0, 0]}>
                        <div style={{
                            color: '#00ffcc',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            textShadow: '0 0 4px #000',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                        }}>
                            ⌖ Centroid
                        </div>
                    </Html>
                </group>
            )}

            {/* 4. Ground Grid System Reference */}
            <gridHelper 
                args={[200, 50, '#1a1a1a', '#0a0a0a']} 
                position={[0, -0.5, 0]} 
            />
            
            {/* Outer coordinate envelope (Bounds indicator) */}
            <axesHelper args={[20]} />
        </group>
    );
}
export default CoordinateSpace3D;
