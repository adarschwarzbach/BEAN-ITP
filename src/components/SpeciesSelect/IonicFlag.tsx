import { Switch } from '@blueprintjs/core';
import React, { useState } from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';

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
		<Switch
			label="Consider Ionic Effect"
			checked={ionicEffect !== 0}
			onChange={toggleIonicEffect}
		/>
	);
};

export default IonicEffectSwitch;
