const BASE_URL = 'https://ngs7p9iikb.execute-api.us-west-1.amazonaws.com';
const BEAN_COMPUTATION_API = `${BASE_URL}/default`; 

export const mobility_plot_computation = async (ionicEffect, speciesObject) => {
	if (typeof speciesObject !== 'object' || speciesObject === null || Object.keys(speciesObject).length === 0) {
		console.error('Invalid species object:', speciesObject);
		return;
	}

	const speciesArray = Object.values(speciesObject);

	const concentrations = speciesArray.map(s => s.concentration);
	const valences = speciesArray.map(s => s.valence);
	const pKa = speciesArray.map(s => s.pKa);
	const mobilities = speciesArray.map(s => s.mobility);
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
		return data;
	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
	}
};
