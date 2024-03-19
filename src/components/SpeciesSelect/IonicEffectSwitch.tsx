import React from 'react';
import { Switch } from '@blueprintjs/core';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import './IonicEffectSwitch.css'; // Import the CSS file

const IonicEffectSwitch: React.FC = () => {
	const { ionicEffect, setIonicEffect } = useSpeciesData();

	const toggleIonicEffect = () => {
		if (ionicEffect !== 0) {
			setIonicEffect(0);
		} else {
			setIonicEffect(1);
		}
	};

	return (
		<div className="switch-container" style = {{width:180}}> {/* Wrap the switch in the new div */}
			<Switch
				// label="Ionic Strength Effects"
				checked={ionicEffect !== 0}
				onChange={toggleIonicEffect}
				labelElement={<span style={{ fontSize: '12px' }}>Ionic Strength Effects</span>}
			/>
		</div>
	);
};

export default IonicEffectSwitch;
