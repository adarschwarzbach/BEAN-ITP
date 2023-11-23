import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';
import { ateHeatmapComputation } from '../../Utils/beanAteHeatmapComputation';


const HeatmapComputationButton: React.FC = () => {
	const {ionicEffect, speciesDict, validInput, setAteHeatmapResults, setAteHeatmapLoading, setHeatmapError} = useSpeciesData();

	// useEffect(() => {
	// 	handleApiCall();
	// }, []);

	// Check if all inputs are valid
	const handleApiCall = async () => {
		setAteHeatmapLoading(true);
		setHeatmapError(false);
		try {
			// Create a copy of ionicEffect (for primitives like numbers, direct assignment is okay)
			const ionicEffectCopy = ionicEffect;
	
			// Create a deep copy of speciesDict
			const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));
            


			const ateHeatmapResults = await ateHeatmapComputation(ionicEffectCopy, speciesDictCopy['1']['pKa'][0], speciesDictCopy);

			if (typeof ateHeatmapResults === 'object' && 'grid_results' in ateHeatmapResults) {
				// It's a valid ateHeatmapResults object, so set the state
				setAteHeatmapResults(ateHeatmapResults);
			} else {
				// It's not a valid ateHeatmapResults object, so set the state to the initial value
				setAteHeatmapResults({ grid_results: [], itpCheck_true_count: 0, total_calculations: 0, total_time: 0 });
				setHeatmapError(true);
			}

		} catch (error) {
			console.error('Error occurred:', error);
			setHeatmapError(true);
		}
		setAteHeatmapLoading(false);

	};

	return (
		<Button 
			onClick={handleApiCall} 
			icon = 'heatmap'
			disabled = {!validInput}
		>
           Create Heatmaps
		</Button>
	);
};

export default HeatmapComputationButton;
