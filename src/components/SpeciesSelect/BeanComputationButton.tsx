import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';
import { ateHeatmapComputation } from '../../Utils/beanAteHeatmapComputation';
import ateHeatmapInitial from '../../Contexts/ateHeatmapInitial';


const BeanComputationButton: React.FC = () => {
	const {setLoading,  ionicEffect, speciesDict, setBeanResults, setError, validInput, setAteHeatmapResults, setAteHeatmapLoading} = useSpeciesData();

	// useEffect(() => {
	// 	handleApiCall();
	// }, []);

	// Check if all inputs are valid
	const handleApiCall = async () => {
		setLoading(true);
		setAteHeatmapLoading(true);
		try {
			// Create a copy of ionicEffect (for primitives like numbers, direct assignment is okay)
			const ionicEffectCopy = ionicEffect;
	
			// Create a deep copy of speciesDict
			const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));

	
			const response = await beanComputation(ionicEffectCopy, speciesDictCopy);
			
			if (response.statusCode != 200) {
				setError(true);
				setLoading(false);
				return;
			}
		
			if (typeof response.body === 'string') {
				const parsedBody = JSON.parse(response.body);
				setBeanResults(parsedBody);
				setError(false);
			} 

			else {
				throw new Error('Error occurred: response.body is not a string');
			}

			setLoading(false);
			// Perform the ateHeatmap computation
			const ateHeatmapResults = await ateHeatmapComputation(ionicEffectCopy, 8.8, speciesDictCopy);

			if (typeof ateHeatmapResults === 'object' && 'grid_results' in ateHeatmapResults) {
				// It's a valid ateHeatmapResults object, so set the state
				setAteHeatmapResults(ateHeatmapResults);
			} else {
				// It's not a valid ateHeatmapResults object, so set the state to the initial value
				setAteHeatmapResults({grid_results: [], itpCheck_true_count: 0, total_calculations: 0, total_time: 0});
			}

			setAteHeatmapLoading(false);

		} catch (error) {
			console.error('Error occurred:', error);
		}
	};

	return (
		<Button 
			onClick={handleApiCall} 
			icon = 'rocket'
			disabled = {!validInput}
		>
           Run
		</Button>
	);
};

export default BeanComputationButton;
