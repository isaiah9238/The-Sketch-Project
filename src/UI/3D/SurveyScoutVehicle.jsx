// src/UI/3D/SurveyScoutVehicle.jsx
import React, { forwardRef } from 'react';

/** * @typedef {Object} ScoutProps
 * @property {import('three').Vector3} [position]
 */

export const SurveyScoutVehicle = forwardRef((
    /** @type {ScoutProps} */ props,
    ref
) => {
    return (
        // Passing props through allows 'position' to be applied to the group
        <group {...props} ref={ref}>
            <mesh>
                <capsuleGeometry args={[0.25, 1.2, 4, 16]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
        </group>
    );
});