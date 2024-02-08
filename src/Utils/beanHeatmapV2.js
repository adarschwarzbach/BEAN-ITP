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
				mobility: speciesObject[key].mobility.map(value => value * 1e-8),
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

	console.log('hitting ');

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
        
		const heatmapDataV2 = {
			sample_mobility_ratio: data.grid_results_1.map((row) =>
				row.map((datapoint) => {
					const datapointObject = datapoint[1];
		
					// Check if the datapointObject contains an errorMessage
					if (datapointObject.errorMessage) {
						return { computation_value: 'error due to timeout or other server-side issue' };
					}
		
					// Assuming the valid response contains a 'body' property with a JSON string
					if (typeof datapointObject.body === 'string') {
						try {
							const parsedBody = JSON.parse(datapointObject.body);
		
							// Check for 'sample_mobility_ratio' in the parsed body
							if (parsedBody && typeof parsedBody.sample_mobility_ratio === 'number' && parsedBody.itpCheck == false) {
								return { computation_value: 'itpCheck failed' };
							}
							else if (parsedBody && typeof parsedBody.sample_mobility_ratio === 'number') {
								return { computation_value: parsedBody.sample_mobility_ratio };
							} else {
								return { computation_value: 'error - missing computation_value' };
							}
						} catch (error) {
							return { computation_value: 'error - Server timed out or invalid JSON format' };
						}
					} else {
						return { computation_value: 'error - body is not a string' };
					}
				})
			),
		
			sample_pre_concentration: data.grid_results_2.map((row) =>
				row.map((datapoint) => {
					const datapointObject = datapoint[1];
	
					// Check if the datapointObject contains an errorMessage
					if (datapointObject.errorMessage) {
						return { computation_value: 'error due to timeout or other server-side issue' };
					}
	
					// Assuming the valid response contains a 'body' property with a JSON string
					if (typeof datapointObject.body === 'string') {
						try {
							const parsedBody = JSON.parse(datapointObject.body);
	
							// Check for 'sample_mobility_ratio' in the parsed body
							if (parsedBody && typeof parsedBody.computation_value === 'number' && parsedBody.itpCheck == false) {
								return { computation_value: 'itpCheck failed' };
							}
							else if(parsedBody && typeof parsedBody.computation_value === 'number') {
								return { computation_value: parsedBody.computation_value };
							} else {
								return { computation_value: 'error - missing computation_value' };
							}
						} catch (error) {
							return { computation_value: 'error - Server timed out or invalid JSON format' };
						}
					} else {
						return { computation_value: 'error - body is not a string' };
					}
				})
			),
			ph_in_sample_region: data.grid_results_3.map((row) =>
				row.map((datapoint) => {
					const datapointObject = datapoint[1];

					// Check if the datapointObject contains an errorMessage
					if (datapointObject.errorMessage) {
						return { computation_value: 'error due to timeout or other server-side issue' };
					}

					// Assuming the valid response contains a 'body' property with a JSON string
					if (typeof datapointObject.body === 'string') {
						try {
							const parsedBody = JSON.parse(datapointObject.body);

							// Check for 'sample_mobility_ratio' in the parsed body
							if (parsedBody && typeof parsedBody.computation_value === 'number' && parsedBody.itpCheck == false) {
								return { computation_value: 'itpCheck failed' };
							}
							else if(parsedBody && typeof parsedBody.computation_value === 'number') {
								return { computation_value: parsedBody.computation_value };
							} else {
								return { computation_value: 'error - missing computation_value' };
							}
						} catch (error) {
							return { computation_value: 'error - Server timed out or invalid JSON format' };
						}
					} else {
						return { computation_value: 'error - body is not a string' };
					}
				})
			),
		};

		return heatmapDataV2;

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