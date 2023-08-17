import React, {useEffect} from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { beanComputation } from '../../Utils/beanComputation';
import { Button } from '@blueprintjs/core';


const BeanComputationButton: React.FC = () => {
	const {setLoading,  ionicEffect, speciesDict, setBeanResults, setError } = useSpeciesData();

	useEffect(() => {
		handleApiCall();
	}, []);

	// Check if all inputs are valid
	const handleApiCall = async () => {
		setLoading(true);
		try {
			const response = await beanComputation(ionicEffect, speciesDict);
			console.log(response);
			if(response.statusCode != 200){
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
		>
            Compute ITP
		</Button>
	);
};

export default BeanComputationButton;
