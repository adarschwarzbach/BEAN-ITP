import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';
import { beanHeatmapComputationV2 } from '../../Utils/beanHeatmapV2';
import { downloadAsJson } from '../../Utils/downloadAsJSON';
import { pruneSpeciesInputs } from '../../Utils/pruneHeatmapInputs';


const HeatmapComputationButton: React.FC = () => {
	const {ionicEffect, loading, speciesDict, validInput, setAteHeatmapResults, setAteHeatmapLoading, setHeatmapError, setHeatmapV2, ateHeatmapLoading, mobilityPlotLoading} = useSpeciesData();
	const handleApiCall = async () => {
		setAteHeatmapLoading(true);
		setHeatmapError(false);
		try {
			const ionicEffectCopy = ionicEffect;
	
			const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));
			let prunedSpecies = await pruneSpeciesInputs(ionicEffectCopy, speciesDictCopy);

			if ('errorMessage' in prunedSpecies) {
				prunedSpecies = speciesDict;
			}
			prunedSpecies['2']['valence'] = prunedSpecies['2']['valence'] > 0 ? [1] : [-1];
			prunedSpecies['3']['valence'] = prunedSpecies['3']['valence'] > 0 ? [1] : [-1];

			const heatmap_v2_results = await beanHeatmapComputationV2(ionicEffectCopy, prunedSpecies['1']['pKa'][0], prunedSpecies);

			if (typeof heatmap_v2_results === 'object' && 'sample_mobility_ratio' in heatmap_v2_results) {
				setHeatmapV2(heatmap_v2_results);				
			} else {
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
				disabled = {!validInput || ateHeatmapLoading || loading } // consider adding mobilityPlotLoading
			>
           Create Heatmaps
			</Button>
		</div>
	);
};

export default HeatmapComputationButton;
