// Define the Species interface
interface Species {
    Name: string;
    valence: number[];
    mobility: number[];
    pKa: number[];
    concentration: number;
    type: string;
}

// Define the ErrorResponse interface
interface ErrorResponse {
    statusCode: number;
    body: {
        error: boolean;
    };
}

// Define the ComputationResponse interface
interface ComputationResponse {
    statusCode: number;
    body: {
        Residue: number[];
        ComputedZoneConcentrations: number[][];
        cMat_init: number[][];
        cH: number[][];
        ComputedEffectiveMobilities: number[][];
        pHInItpZones: number[][];
        ConductivityInItpZones: number[][];
        LEZoneConditionSatisfied: boolean;
        AnalyteZoneConditionSatisfied: boolean;
        TEZoneConditionSatisfied: boolean;
        StableItpPredicted: boolean;
        analyteZone: string[];
        adjustedTeZone?: string[];
        runTime: number;
    };
}

// Base URL and Endpoint for the API request
const BASE_URL = 'https://dcll8lpii8.execute-api.us-west-1.amazonaws.com';
const BEAN_COMPUTATION_API = `${BASE_URL}/prod/`;

// Function to perform the computation
export const ateHeatmapComputation = async (ionicEffect, pH, speciesObject) => {
	console.log('hit');
	const modifiedSpeciesObject = { ...speciesObject };
	for (const key in modifiedSpeciesObject) {
		if (modifiedSpeciesObject[key].mobility) {
			modifiedSpeciesObject[key].mobility = modifiedSpeciesObject[key].mobility.map(value => value * 1e-8);
		}
		modifiedSpeciesObject[key].concentration = modifiedSpeciesObject[key].concentration / 1000;
	}

	const requestData = {
		'ionicEffect':ionicEffect,
		'pH':pH,
		'species': modifiedSpeciesObject
	};
    
	await postData();

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
		console.log(data);
		return data;

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



async function postData() {
	const url = 'https://dcll8lpii8.execute-api.us-west-1.amazonaws.com/prod/';
	const data = {
		ionicEffect: 0,
		pH: 8.7,
		species: {
			'0': {
				Name: 'HCl',
				valence: [-1],
				mobility: [-7.91e-8],
				pKa: [-2],
				concentration: 0.00001,
				type: 'LE'
			},
			'1': {
				Name: 'Tris',
				valence: [1],
				mobility: [2.95e-8],
				pKa: [8.076],
				concentration: 0.00002,
				type: 'Background'
			},
			'2': {
				Name: 'MOPS',
				valence: [-1],
				mobility: [-2.69e-8],
				pKa: [7.2],
				concentration: 0.000001,
				type: 'Analyte'
			},
			'3': {
				Name: 'HEPES',
				valence: [-1],
				mobility: [-2.35e-8],
				pKa: [7.5],
				concentration: 0.000005,
				type: 'TE'
			}
		}
	};
  
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
        
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
        
		const responseData = await response.json();
		console.log(responseData);
	} catch (error) {
		console.error('Error posting data:', error);
	}
}

// Example usage: