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
const BASE_URL = 'https://87wq9jocd2.execute-api.us-west-1.amazonaws.com';
const BEAN_COMPUTATION_API = `${BASE_URL}/default/beanComputation`;

// Function to perform the computation
export const beanComputation = async (ionicEffect: number, speciesObject: Record<string, Species>): Promise<ComputationResponse | ErrorResponse> => {
	// Modify mobility and concentration data
	const modifiedSpeciesObject = { ...speciesObject };
	for (const key in modifiedSpeciesObject) {
		if (modifiedSpeciesObject[key].mobility) {
			modifiedSpeciesObject[key].mobility = modifiedSpeciesObject[key].mobility.map(value => value * 1e-8);
		}
		// Convert concentration from mM to M
		modifiedSpeciesObject[key].concentration = modifiedSpeciesObject[key].concentration / 1000;
	}

	// Prepare request data
	const requestData = {
		ionicEffect,
		species: modifiedSpeciesObject
	};

	// Make the API request
	try {
		const response = await fetch(BEAN_COMPUTATION_API, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestData),
		});

		// Check for errors
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
        
		// Parse and return the response
		const data = await response.json();
		return data;

	} catch (error) {
		// Handle errors
		if (error instanceof Error) {
			console.error('There was a problem with the fetch operation:', error.message);
		} else {
			console.error('An unknown error occurred:', error);
		}
		return {
			statusCode: 400,
			body: {
				error: true
			}
		};
	}
};
