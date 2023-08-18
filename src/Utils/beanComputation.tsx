interface Species {
    Name: string;
    valence: number[];
    mobility: number[];
    pKa: number[];
    concentration: number;
    type: string;
}

interface ErrorResponse {
	statusCode: number;
	body: {
		error:boolean;
	};
}


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
        adjustedTeZone?: string[]; // Use more specific type if you know what might be inside
        runTime: number;
    };
}

const BASE_URL = 'https://87wq9jocd2.execute-api.us-west-1.amazonaws.com';
const BEAN_COMPUTATION_API = `${BASE_URL}/default/beanComputation`;


export const beanComputation = async (ionicEffect: number, speciesObject: Record<string, Species>): Promise<ComputationResponse | ErrorResponse> => {
	// Transforming mobility data
	const modifiedspeciesObject = { ...speciesObject };

	for (const key in modifiedspeciesObject) {
		if (modifiedspeciesObject[key].mobility) {
			modifiedspeciesObject[key].mobility = modifiedspeciesObject[key].mobility.map(value => value * 1e-8);
		}
	}

	const requestData = {
		ionicEffect,
		species: modifiedspeciesObject
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
			throw new Error('Network response was not ok');
		}
        
		const data = await response.json();
		return data;

	} catch (error) {
		if (error instanceof Error) {
			console.error('There was a problem with the fetch operation:', error.message);
		} else {
			console.error('An unknown error occurred:', error);
		}
		return {
			statusCode: 400,
			body: {
				error: false
			}
		};
	}
};