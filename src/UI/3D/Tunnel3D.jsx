// src/UI/3D/Tunnel3D.jsx
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SurveyScoutVehicle } from './SurveyScoutVehicle.jsx';

/**
 * @typedef {Object} Point3D
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @param {Object} props
 * @param {Point3D[]} props.points3D
 */

export function Tunnel3D({ points3D }) {
    // 1. Explicitly type the ref to THREE.Group
    const travelerRef = useRef(null);

    const splineCurve = useMemo(() => {
        if (!points3D || points3D.length < 2) return null;
        const threePoints = points3D.map(p => new THREE.Vector3(p.x, p.y, p.z));
        return new THREE.CatmullRomCurve3(threePoints, false, 'catmullrom', 0.5);
    }, [points3D]);

    // 2. Pre-calculate fleet data with proper typing
    const tunnelFleetData = useMemo(() => {
        if (!splineCurve) return [];
        const fleetShips = [];
        const shipCount = 200;
        for (let i = 0; i < shipCount; i++) {
            const progress = i / shipCount;
            fleetShips.push({
                position: splineCurve.getPointAt(progress),
                lookAt: splineCurve.getPointAt(progress).add(splineCurve.getTangentAt(progress))
            });
        }
        return fleetShips;
    }, [splineCurve]);

    return (
        <group>
            {/* The Fleet Wall */}
            {tunnelFleetData.map((data, index) => (
                <FleetShip key={index} position={data.position} lookAt={data.lookAt} />
            ))}

            {/* Traveler */}
            <SurveyScoutVehicle ref={travelerRef} />
        </group>
    );
}

/**
 * @param {Object} props
 * @param {THREE.Vector3} props.position
 * @param {THREE.Vector3} props.lookAt
 */
function FleetShip({ position, lookAt }) {
    // Correct type for Three.js objects in React Three Fiber
    /** @type {React.Ref<THREE.Group>} */
    const shipRef = useRef(null);

    useMemo(() => {
        // shipRef.current is now correctly typed as THREE.Group
        if (shipRef.current) {
            shipRef.current.lookAt(lookAt);
        }
    }, [lookAt]);

    return <SurveyScoutVehicle ref={shipRef} position={position} />;
}