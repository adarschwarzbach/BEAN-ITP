const BASE_URL = 'https://ngs7p9iikb.execute-api.us-west-1.amazonaws.com';
const BEAN_COMPUTATION_API = `${BASE_URL}/default`; // Change from /prod to /default to match the curl command

export const mobility_plot_computation = async (ionicEffect, speciesObject) => {
	console.log('m plot hit');
	// Validate the input speciesObject
	if (typeof speciesObject !== 'object' || speciesObject === null || Object.keys(speciesObject).length === 0) {
		console.error('Invalid species object:', speciesObject);
		return;
	}

	// Convert the species object into an array of species
	const speciesArray = Object.values(speciesObject);

	// Transform species object to match the expected payload structure
	const concentrations = speciesArray.map(s => s.concentration);
	const valences = speciesArray.map(s => s.valence);
	const pKa = speciesArray.map(s => s.pKa);
	const mobilities = speciesArray.map(s => s.mobility); // Convert mobility values as needed
	const labels = speciesArray.map(s => s.Name);

	const requestData = {
		ionicEffect: ionicEffect,
		concentrations: concentrations,
		valences: valences,
		pKa: pKa,
		mobilities: mobilities,
		labels: labels,
		ionic_effect_flag: ionicEffect 
	};

	try {
		const response = await fetch(BEAN_COMPUTATION_API, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestData)
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Server responded with an error:', errorData);
			throw new Error(`Server responded with status: ${response.status}`);
		}

		const data = await response.json();
		console.log('m plot data', data);
		return data;
		// Process the response data as needed
	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
	}
};
