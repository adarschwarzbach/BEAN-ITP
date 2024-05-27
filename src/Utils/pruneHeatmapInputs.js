const BASE_URL = 'https://vpqyduqulg.execute-api.us-west-1.amazonaws.com';
const PRUNE_SPECIES_API = `${BASE_URL}/prod/prune_species_inputs`;

export const pruneSpeciesInputs = async (ionicEffect, speciesObject) => {
	// Check if speciesObject is indeed an object
	if (typeof speciesObject !== 'object' || speciesObject === null) {
		console.error('speciesObject is not an object:', speciesObject);
		return {
			statusCode: 400,
			body: {
				error: 'speciesObject is not an object'
			}
		};
	}

	// Prepare the request data
	const requestData = {
		'ionicEffect': ionicEffect,
		'species': speciesObject,
	};

	try {
		const response = await fetch(PRUNE_SPECIES_API, {
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
		return {
			statusCode: 400,
			body: {
				error: true,
				message: error.message
			}
		};
	}
};