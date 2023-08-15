import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';


const BeanComputationButton: React.FC = () => {
	const {setLoading,  ionicEffect, speciesDict, setBeanResults } = useSpeciesData();

	// Check if all inputs are valid
	const handleApiCall = async () => {
		setLoading(true);
		try {
			const response = await beanComputation(ionicEffect, speciesDict);
    
			if (typeof response.body === 'string') {
				const parsedBody = JSON.parse(response.body);
				setBeanResults(parsedBody);
				console.log(parsedBody);
			} 
			// else {
			// 	console.log(response.body);
			// }
    
		} catch (error) {
			console.error('Error occurred:', error);
		}
		setLoading(false);
	};

	return (
		<Button 
			onClick={handleApiCall} 
			icon = 'rocket'
		>
            Compute ITP
		</Button>
	);
};

export default BeanComputationButton;
