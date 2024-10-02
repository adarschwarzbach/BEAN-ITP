import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';
import { ateHeatmapComputation } from '../../Utils/beanAteHeatmapComputation';
import ateHeatmapInitial from '../../Contexts/ateHeatmapInitial';
import { mobility_plot_computation } from '../../Utils/mobility_plot_computation';
import ts from 'typescript';
import { downloadAsJson } from '../../Utils/downloadAsJSON';

const BeanComputationButton: React.FC = () => {
	const {setLoading,  ionicEffect, speciesDict, setBeanResults, setError, validInput, setAteHeatmapResults, setAteHeatmapLoading, setMobilityData, mobilityPlotLoading, setMobilityPlotLoading} = useSpeciesData();

	// useEffect(() => {
	// 	handleApiCall();
	// }, []);

	// Check if all inputs are valid
	const handleApiCall = async () => {
		setLoading(true);
		setMobilityPlotLoading(true);
	
		try {
			// Create a copy of ionicEffect (for primitives like numbers, direct assignment is okay)
			const ionicEffectCopy = ionicEffect;
	
			// Create a deep copy of speciesDict
			const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));
	
			// Run both API calls in parallel using Promise.all
			const [response, mobilityDataResponse] = await Promise.all([
				beanComputation(ionicEffectCopy, speciesDictCopy),
				mobility_plot_computation(ionicEffectCopy, speciesDictCopy)
			]);
	
			// Process mobility plot data
			const parsedMobility = JSON.parse(mobilityDataResponse.body);
			setMobilityData({
				lin_pH: parsedMobility.lin_pH,
				sol1: parsedMobility.sol1,
				sol2: parsedMobility.sol2,
			});
			setMobilityPlotLoading(false);
	
			// Process bean computation response
			if (response.statusCode !== 200) {
				setError(true);
				setLoading(false);
				return;
			}
	
			if (typeof response.body === 'string') {
				const parsedBody = JSON.parse(response.body);
				// downloadAsJson(parsedBody, 'beanComputation.json'); // if new initial data is needed
				setBeanResults(parsedBody);
				setError(false);
			} else {
				console.log('Error occurred: response.body is not a string');
			}
	
			setLoading(false);
		} catch (error) {
			console.error('Error occurred:', error);
			setError(true);
			setLoading(false);
			setMobilityPlotLoading(false);
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
