import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';
// import { ateHeatmapComputation } from '../../Utils/beanAteHeatmapComputation';
import { beanHeatmapComputationV2 } from '../../Utils/beanHeatmapV2';
import { downloadAsJson } from '../../Utils/downloadAsJSON';
import { pruneSpeciesInputs } from '../../Utils/pruneHeatmapInputs';


const HeatmapComputationButton: React.FC = () => {
	const {ionicEffect, speciesDict, validInput, setAteHeatmapResults, setAteHeatmapLoading, setHeatmapError, setHeatmapV2} = useSpeciesData();

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

			// Turn valence to +-1
            

			
			// const heatmap_v2_results = await beanHeatmapComputationV2(ionicEffectCopy, speciesDictCopy['1']['pKa'][0], speciesDictCopy);
			let prunedSpecies = await pruneSpeciesInputs(ionicEffectCopy, speciesDictCopy);

			// Try to force heatmap on prune failure
			if ('errorMessage' in prunedSpecies) {
				prunedSpecies = speciesDict;
				// console.log('prune failure');
			}
			else {
				// console.log('pruned');
			}

			prunedSpecies['2']['valence'] = prunedSpecies['2']['valence'] > 0 ? [1] : [-1];
			prunedSpecies['3']['valence'] = prunedSpecies['3']['valence'] > 0 ? [1] : [-1];

			// console.log('pruned species', prunedSpecies);

			const heatmap_v2_results = await beanHeatmapComputationV2(ionicEffectCopy, prunedSpecies['1']['pKa'][0], prunedSpecies);

			if (typeof heatmap_v2_results === 'object' && 'sample_mobility_ratio' in heatmap_v2_results) {
				// It's a valid ateHeatmapResults object, so set the state
				setHeatmapV2(heatmap_v2_results);
				// downloadAsJson(heatmap_v2_results); // If new initial data is needed
				
			} else {
				// It's not a valid ateHeatmapResults object, so set the state to the initial value
				setHeatmapV2({ sample_mobility_ratio: [], sample_pre_concentration:[], ph_in_sample_region:[] });
				setHeatmapError(true);
			}

		} catch (error) {
			console.error('Error occurred:', error);
			setHeatmapError(true);
		}
		setAteHeatmapLoading(false);

	};

	return (
		<div style = {{width:160}}>
			<Button 
				onClick={handleApiCall} 
				icon = 'heatmap'
				disabled = {!validInput}
			>
           Create Heatmaps
			</Button>
		</div>
	);
};

export default HeatmapComputationButton;
