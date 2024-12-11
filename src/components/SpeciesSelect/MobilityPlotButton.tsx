import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';
import { beanHeatmapComputationV2 } from '../../Utils/beanHeatmapV2';


const HeatmapComputationButton: React.FC = () => {
	const {ionicEffect, speciesDict, validInput, setAteHeatmapResults, setAteHeatmapLoading, setHeatmapError, setHeatmapV2} = useSpeciesData();

	const handleApiCall = async () => {
		setAteHeatmapLoading(true);
		setHeatmapError(false);
		try {
			const ionicEffectCopy = ionicEffect;
			const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));
        

			const heatmap_v2_results = await beanHeatmapComputationV2(ionicEffectCopy, speciesDictCopy['1']['pKa'][0], speciesDictCopy);

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
				disabled = {!validInput}
			>
           Mobility Plot
			</Button>
		</div>
	);
};

export default HeatmapComputationButton;
