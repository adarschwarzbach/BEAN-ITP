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
	const {setLoading, loading,  ionicEffect, speciesDict, setBeanResults, setError, validInput, setAteHeatmapResults, setAteHeatmapLoading, setMobilityData, mobilityPlotLoading, setMobilityPlotLoading, ateHeatmapLoading } = useSpeciesData();

	// useEffect(() => {
	// 	handleApiCall();
	// }, []);

	// Check if all inputs are valid
	const handleApiCall = async () => {
		// Set the loading states for both operations initially
		setLoading(true);
		setMobilityPlotLoading(true);
	
		// Create a copy of ionicEffect (for primitives like numbers, direct assignment is okay)
		const ionicEffectCopy = ionicEffect;
	
		// Create a deep copy of speciesDict
		const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));
	
		// Handle bean computation in isolation
		const handleBeanComputation = async () => {
			try {
				const response = await beanComputation(ionicEffectCopy, speciesDictCopy);
	
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
				console.error('Error occurred in bean computation:', error);
				setError(true);
				setLoading(false);
			}
		};
	
		// Handle mobility plot computation in isolation
		const handleMobilityPlot = async () => {
			try {
				const mobility_data = await mobility_plot_computation(ionicEffectCopy, speciesDictCopy);
				const parsedMobility = JSON.parse(mobility_data.body);
				
				// Update mobility data state
				setMobilityData({
					lin_pH: parsedMobility.lin_pH,
					sol1: parsedMobility.sol1,
					sol2: parsedMobility.sol2,
				});
				
				setMobilityPlotLoading(false);
			} catch (error) {
				console.error('Error occurred in mobility plot computation:', error);
				setMobilityPlotLoading(false);
			}
		};
	
		// Run both computations in parallel
		handleBeanComputation();
		handleMobilityPlot();
	};
	

	return (
		<Button 
			onClick={handleApiCall} 
			icon = 'rocket'
			disabled = {!validInput || loading  || ateHeatmapLoading } // consider adding mobilityPlotLoading
		>
           Run
		</Button>
	);
};

export default BeanComputationButton;
