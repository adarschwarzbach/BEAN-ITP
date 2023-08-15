import React, { createContext, useContext, useState } from 'react';

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
}

interface DataProviderProps {
    children: React.ReactNode;
}
const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {

	const [ionicEffect, setIonicEffect] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [speciesDict, setSpeciesDict] = useState<Record<string, Species>>({
		'0': {
			'Name': 'HCl',
			'valence': [-1],
			'mobility': [-7.91],
			'pKa': [-2],
			'concentration': 0.01,
			'type': 'LE'
		},
		'1': {
			'Name': 'Tris',
			'valence': [1],
			'mobility': [2.95],
			'pKa': [8.076],
			'concentration': 0.02,
			'type': 'Background'
		},
		'2': {
			'Name': 'MOPS',
			'valence': [-1],
			'mobility': [-2.69],
			'pKa': [7.2],
			'concentration': 0.001,
			'type': 'Analyte'
		},
		'3': {
			'Name': 'HEPES',
			'valence': [-1],
			'mobility': [-2.35],
			'pKa': [7.5],
			'concentration': 0.005,
			'type': 'TE'
		}
	}
	);

	return (
		<DataContext.Provider value={{ ionicEffect, setIonicEffect, loading, setLoading, speciesDict, setSpeciesDict }}>
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
