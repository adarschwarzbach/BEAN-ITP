const BASE_URL = 'https://vpqyduqulg.execute-api.us-west-1.amazonaws.com';
const BEAN_COMPUTATION_API = `${BASE_URL}/prod`;


export const beanHeatmapComputationV2 = async (ionicEffect, pH, speciesObject) => {
    
	// Check if speciesObject is indeed an object
	if (typeof speciesObject !== 'object' || speciesObject === null) {
		console.error('speciesObject is not an object:', speciesObject);
		return;
	}

	// Convert the species object to the desired format
	const modifiedSpeciesObject = {};
	for (const key in speciesObject) {
		if (Object.prototype.hasOwnProperty.call(speciesObject, key)) {
			modifiedSpeciesObject[Number(key)] = {
				...speciesObject[key],
				mobility: speciesObject[key].mobility, // .map(value => value * 1e-8)
				concentration: speciesObject[key].concentration / 1000,
			};
		}
	}


	const requestData = {
		'ionicEffect': ionicEffect,
		'pH': pH,
		'species': modifiedSpeciesObject,
		'requestedOutput': 'ATE_pH',
	};

	console.log(requestData);
	
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

		console.log('Data received from the server:', data);
        
		const ateHeatmapInitial = {
			grid_results: data.grid_results.map((row) =>
				row.map((datapoint) => ({
					statusCode: datapoint.statusCode,
					body: JSON.parse(datapoint.body), // Parse the body JSON string
				}))
			),
			total_time: data.total_time,
			total_calculations: data.total_calculations,
			itpCheck_true_count: data.itpCheck_true_count,
		};

		return ateHeatmapInitial;

	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
		return {
			statusCode: 400,
			body: {
				error: true
			}
		};
	}
};