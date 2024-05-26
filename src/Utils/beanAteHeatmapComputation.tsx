interface computationValue {
	ATE_pH: number;
	sample_pH: number;
	sample_c_sample: number;
	result: number;
}

interface ateBody {
	computation_value: computationValue;
	itpCheck: boolean;
	type?: string;
}

interface ateHeatmapResults {
	grid_results: ateHeatmapDatapoint[][];
	itpCheck_true_count: number;
	total_calculations: number;
	total_time: number;
  }
  
interface ateHeatmapDatapoint {
statusCode: number;
body: ateBody;
}

// Base URL and Endpoint for the API request
const BASE_URL = 'https://dcll8lpii8.execute-api.us-west-1.amazonaws.com';
const BEAN_COMPUTATION_API = `${BASE_URL}/prod/`;

// Function to perform the computation
export const ateHeatmapComputation = async (ionicEffect, pH, speciesObject) => {
    
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

	try {
		const response = await fetch(BEAN_COMPUTATION_API, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Server responded with an error:', errorData);
			throw new Error(`Server responded with status: ${response.status}`);
		}

		const data = await response.json();

		console.log('Data received from the server:', data);
        
		const ateHeatmapInitial: ateHeatmapResults = {
			grid_results: data.grid_results.map((row) =>
				row.map((datapoint) => ({
					statusCode: datapoint.statusCode,
					body: JSON.parse(datapoint.body) as ateBody, // Parse the body JSON string
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



// async function postData() {
// 	const url = 'https://dcll8lpii8.execute-api.us-west-1.amazonaws.com/prod/';
// 	const data = {
// 		ionicEffect: 0,
// 		pH: 8.7,
// 		species: {
// 			'0': {
// 				Name: 'HCl',
// 				valence: [-1],
// 				mobility: [-7.91e-8],
// 				pKa: [-2],
// 				concentration: 0.00001,
// 				type: 'LE'
// 			},
// 			'1': {
// 				Name: 'Tris',
// 				valence: [1],
// 				mobility: [2.95e-8],
// 				pKa: [8.076],
// 				concentration: 0.00002,
// 				type: 'Background'
// 			},
// 			'2': {
// 				Name: 'MOPS',
// 				valence: [-1],
// 				mobility: [-2.69e-8],
// 				pKa: [7.2],
// 				concentration: 0.000001,
// 				type: 'Analyte'
// 			},
// 			'3': {
// 				Name: 'HEPES',
// 				valence: [-1],
// 				mobility: [-2.35e-8],
// 				pKa: [7.5],
// 				concentration: 0.000005,
// 				type: 'TE'
// 			}
// 		}
// 	};
  
// 	console.log(data);
// 	try {
// 		const response = await fetch(url, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 			},
// 			body: JSON.stringify(data),
// 		});
        
// 		if (!response.ok) {
// 			throw new Error(`HTTP error! Status: ${response.status}`);
// 		}
        
// 		const responseData = await response.json();
// 		console.log(responseData);
// 	} catch (error) {
// 		console.error('Error posting data:', error);
// 	}
// }
