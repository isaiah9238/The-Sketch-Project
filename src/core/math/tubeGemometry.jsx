import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Tube } from '@react-three/drei';
import * as THREE from 'three';
import { use3DCoordinates } from './hooks.js';

export function Tunnel3D() {
    const points3D = use3DCoordinates(0.1);

    const curve = useMemo(() => {
        if (!points3D || points3D.length < 2) return null;
        // Transform your survey points into a smooth spline
        const vec3s = points3D.map(p => new THREE.Vector3(p.x, p.y, p.z));
        return new THREE.CatmullRomCurve3(vec3s, true); // true = closed loop
    }, [points3D]);

    if (!curve) return null;

    return (
        <Tube args={[curve, 100, 2, 8, false]}>
            {/* 8 radial segments = Octagon, 6 = Hexagon, 3 = Triangle */}
            <meshStandardMaterial
                color="#00ffcc"
                wireframe={true} // Helps see the 'stormwater' texture
                emissive="#004444"
            />
        </Tube>
    );
}