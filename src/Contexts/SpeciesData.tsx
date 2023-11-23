import React, { createContext, useContext, useState } from 'react';
import ateHeatmapInitial from './ateHeatmapInitial';
import { type } from 'os';

const initialData = 
{
	'Residue': [1.84430248850731e-12, 3.177014207267348e-12, 2.230327034169477e-12, 3.840594509085804e-12],
	'ComputedZoneConcentrations': [
		[10.0, 0.0, 0.0, 0.0],
		[20.0, 16.554550572712998, 16.09768634504494, 20.0],
		[0.0, 6.540734950270157, 0.0, 0.0],
		[0.0, 0.0, 6.077203891937898, 5.0]
	],
	'cMat_init': [
		[10.0, 0.0, 0.0, 0.0],
		[20.0, 20.0, 20.0, 20.0],
		[0.0, 1.0, 0.0, 0.0],
		[0.0, 0.0, 5.0, 5.0]
	],
	'cH': [
		[8.396585528437043e-09, 4.865719840824042e-09, 4.198872356494103e-09, 2.5311705295064293e-09]
	],
	'ComputedEffectiveMobilities': [
		[-7.909999999335831e-08, -7.90999999961512e-08, -7.90999999966787e-08, -7.909999999799785e-08],
		[1.4751744280236849e-08, 1.0824681341518955e-08, 9.835788917948838e-09, 6.834257715745019e-09],
		[-2.374066553177546e-08, -2.4974086773336555e-08, -2.522156436075475e-08, -2.5862491263803466e-08],
		[-1.8569392678556547e-08, -2.036628862771781e-08, -2.074542271929431e-08, -2.175840020144904e-08]
	],
	'pHInItpZones': [
		[8.075897283893521, 8.312852900560753, 8.376867327484673, 8.596678594656519]
	],
	'ConductivityInItpZones': [
		[0.10482621994445795, 0.0330965753886459, 0.027492594753532867, 0.023766789450138753]
	],
	'LEZoneConditionSatisfied': true,
	'AnalyteZoneConditionSatisfied': true,
	'TEZoneConditionSatisfied': true,
	'StableItpPredicted': true,
	'analyteZone': ['Iteration = 1, Err=5.95583', 'Iteration = 11, Err=4.35523e-05', 'Iteration = 21, Err=3.9534e-10'],
	'adjustedTeZone': [],
	'runTime': 0.08933067321777344
};


interface ComputationResult {
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
	adjustedTeZone: string[]; // I'm using 'any[]' because I don't have specific data about the items of this array.
	runTime: number;
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
	type?: string;
  }
  
  interface computationValue {
	ATE_pH: number;
	sample_pH: number;
	sample_c_sample: number;
}

interface ateBody {
	computation_value: computationValue;
	itpCheck: boolean;
	type?: string;
}

interface Species {
    Name: string;
    valence: number[];
    mobility: number[];
    pKa: number[];
    concentration: number;
	type: string;
}

interface DataContextProps {
    ionicEffect: number;
    setIonicEffect: React.Dispatch<React.SetStateAction<number>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    speciesDict: Record<string, Species>;
    setSpeciesDict: React.Dispatch<React.SetStateAction<Record<string, Species>>>;
	beanResults: ComputationResult;
	setBeanResults: React.Dispatch<React.SetStateAction<ComputationResult>>;
	ateHeatmapResults: ateHeatmapResults;
	setAteHeatmapResults: React.Dispatch<React.SetStateAction<ateHeatmapResults>> ;
	validInput: boolean;
	setValidInput: React.Dispatch<React.SetStateAction<boolean>>;
	error: boolean;
	setError: React.Dispatch<React.SetStateAction<boolean>>;
	gloablLoading: boolean;
	setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
	ateHeatmapLoading: boolean;
	setAteHeatmapLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DataProviderProps {
    children: React.ReactNode;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
	const [validInput, setValidInput] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);
	const [ionicEffect, setIonicEffect] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [gloablLoading, setGlobalLoading] = useState<boolean>(true);
	const [beanResults, setBeanResults] = useState<ComputationResult>(initialData);
	const [ateHeatmapResults, setAteHeatmapResults] = useState<ateHeatmapResults>(ateHeatmapInitial);
	const [ateHeatmapLoading, setAteHeatmapLoading] = useState<boolean>(false);
	const [speciesDict, setSpeciesDict] = useState<Record<string, Species>>({
		'0': {
			'Name': 'HCl',
			'valence': [-1],
			'mobility': [-7.91],
			'pKa': [-2],
			'concentration': 10,
			'type': 'LE'
		},
		'1': {
			'Name': 'Tris',
			'valence': [1],
			'mobility': [2.95],
			'pKa': [8.076],
			'concentration': 20,
			'type': 'Background'
		},
		'2': {
			'Name': 'MOPS',
			'valence': [-1],
			'mobility': [-2.69],
			'pKa': [7.2],
			'concentration': 1,
			'type': 'Analyte'
		},
		'3': {
			'Name': 'HEPES',
			'valence': [-1],
			'mobility': [-2.35],
			'pKa': [7.5],
			'concentration': 5,
			'type': 'TE'
		}
	}
	);

	return (
		<DataContext.Provider value={{ ionicEffect, setIonicEffect, loading, setLoading, speciesDict, setSpeciesDict, beanResults, setBeanResults, ateHeatmapResults, setAteHeatmapResults, validInput, setValidInput, error, setError, gloablLoading, setGlobalLoading, ateHeatmapLoading, setAteHeatmapLoading}}>
			{children}
		</DataContext.Provider>
	);
};

export const useSpeciesData = () => {
	const context = useContext(DataContext);
	if (context === undefined) {
		throw new Error('useData must be used within a DataProvider');
	}
	return context;
};
