import React, { createContext, useContext, useState } from 'react';
import heatmap_V2_initial from './heatmap_V2_initial.json';
import ateHeatmapInitial from './ateHeatmapInitial';
import MobilityPlotInitial from './MobilityPlotInitial.json';
import BeanComputation from './beanComputation.json';

const initialData = BeanComputation;

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


interface ComputationValue {
	computation_value: number | string;
  }
  
interface HeatmapV2 {
	sample_mobility_ratio: ComputationValue[][]; 
	sample_pre_concentration: ComputationValue[][];
	ph_in_sample_region: ComputationValue[][];
}

interface MobilityData {
    lin_pH: number[];
	sol1: number[][];
	sol2: number[][];
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
	mobilityPlotLoading: boolean;
	setMobilityPlotLoading: React.Dispatch<React.SetStateAction<boolean>>;
	heatmapError: boolean;
	setHeatmapError: React.Dispatch<React.SetStateAction<boolean>>;
	heatmapV2: HeatmapV2;
	setHeatmapV2: React.Dispatch<React.SetStateAction<HeatmapV2>>;
	mobilityData: MobilityData;
    setMobilityData: React.Dispatch<React.SetStateAction<MobilityData>>;
}

interface DataProviderProps {
    children: React.ReactNode;
}




const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
	const [validInput, setValidInput] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);
	const [heatmapError, setHeatmapError] = useState<boolean>(false);
	const [ionicEffect, setIonicEffect] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [gloablLoading, setGlobalLoading] = useState<boolean>(true);
	const [beanResults, setBeanResults] = useState<ComputationResult>(initialData);
	const [ateHeatmapResults, setAteHeatmapResults] = useState<ateHeatmapResults>(ateHeatmapInitial);
	const [ateHeatmapLoading, setAteHeatmapLoading] = useState<boolean>(false);
	const [mobilityPlotLoading, setMobilityPlotLoading] = useState<boolean>(false);
	const [heatmapV2, setHeatmapV2] = useState<HeatmapV2>(heatmap_V2_initial);
	const [mobilityData, setMobilityData] = useState<MobilityData>(MobilityPlotInitial);
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
			'Name': 'Fluorescein',
			'valence': [-2, -1],
			'mobility': [-3.95, -2.5],
			'pKa': [6.8, 4.45],
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
		<DataContext.Provider value={{ ionicEffect, setIonicEffect, loading, setLoading, speciesDict, setSpeciesDict, beanResults, setBeanResults, ateHeatmapResults, setAteHeatmapResults, validInput, setValidInput, error, setError, gloablLoading, setGlobalLoading, ateHeatmapLoading, setAteHeatmapLoading, heatmapError, setHeatmapError, heatmapV2, setHeatmapV2, mobilityData, setMobilityData, mobilityPlotLoading, setMobilityPlotLoading}}>
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
