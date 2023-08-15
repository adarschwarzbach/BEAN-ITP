import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';


const BeanComputationButton: React.FC = () => {
	const { ionicEffect, speciesDict } = useSpeciesData();

	// Check if all inputs are valid
	const handleApiCall = async () => {
		try {
			const response = await beanComputation(ionicEffect, speciesDict);
    
			if (typeof response.body === 'string') {
				const parsedBody = JSON.parse(response.body);
				console.log(parsedBody);
			} else {
				console.log(response.body);
			}
    
		} catch (error) {
			console.error('Error occurred:', error);
		}
	};

	return (
		<Button 
			onClick={handleApiCall} 
		>
            Make API Call
		</Button>
	);
};

export default BeanComputationButton;
