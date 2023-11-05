import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';
import { ateHeatmapComputation } from '../../Utils/beanAteHeatmapComputation';


const BeanComputationButton: React.FC = () => {
	const {setLoading,  ionicEffect, speciesDict, setBeanResults, setError, validInput } = useSpeciesData();

	// useEffect(() => {
	// 	handleApiCall();
	// }, []);

	// Check if all inputs are valid
	const handleApiCall = async () => {
		setLoading(true);
		try {
			// Create a copy of ionicEffect (for primitives like numbers, direct assignment is okay)
			const ionicEffectCopy = ionicEffect;
	
			// Create a deep copy of speciesDict
			const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));

	
			const response = await beanComputation(ionicEffectCopy, speciesDictCopy);

			ateHeatmapComputation(ionicEffectCopy, 8.7, speciesDictCopy).then(response => {
				console.log(response.body);
			}).catch(error => {
				console.error('An error occurred:', error);
			});

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
		} catch (error) {
			console.error('Error occurred:', error);
		}
		setLoading(false);
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
