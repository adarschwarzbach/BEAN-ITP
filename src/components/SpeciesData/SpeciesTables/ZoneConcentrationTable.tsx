import React from 'react';
import { Column, Table2, Cell, TableLoadingOption } from '@blueprintjs/table';
import './ZoneConcentrationTable.css';
import { useSpeciesData } from '../../../Contexts/SpeciesData';

type SpeciesData = {
    species: string;
    zone1: number;
    zone2: number;
    zone3: number;
    zone4: number;
};

function truncateToThreeDecimal(num: number): number {
	return Math.trunc(num * 1000) / 1000;
}

const columnNames = ['Species', 'LE', 'Sample', 'ATE', 'TE'];

function toThreeSigFigs(num: number): number {
	if (num === 0) return 0;
	const magnitude = Math.floor(Math.log10(Math.abs(num)));
	const factor = Math.pow(10, 3 - 1 - magnitude);
	return Math.round(num * factor) / factor;
}

const ZoneConcentrationsTable: React.FC = () => {
	const { loading, speciesDict, beanResults, error } = useSpeciesData();
	const loadingOptions = loading ? [TableLoadingOption.CELLS] : [];

	const computedZoneConcentrations = beanResults?.ComputedZoneConcentrations ?? [];

	const speciesList = Object.values(speciesDict).map(species => species.Name);

	const data: SpeciesData[] = computedZoneConcentrations.map((row, index) => ({
		species: speciesList[index],
		zone1: row[0],
		zone2: row[1],
		zone3: row[2],
		zone4: row[3],
	}));

	const renderCell = (rowIndex: number, columnIndex: number) => {
		if (error) return <Cell />;
		const rowData = data[rowIndex];
		switch (columnIndex) {
		case 0: return <Cell>{rowData.species}</Cell>;
		case 1: return <Cell>{toThreeSigFigs(rowData.zone1)}</Cell>;
		case 2: return <Cell>{toThreeSigFigs(rowData.zone2)}</Cell>;
		case 3: return <Cell>{toThreeSigFigs(rowData.zone3)}</Cell>;
		case 4: return <Cell>{toThreeSigFigs(rowData.zone4)}</Cell>;
		default: return <Cell />;
		}
	};

	const renderColumns = (): JSX.Element[] => {
		return columnNames.map((columnName, columnIndex) => (
			<Column
				key={columnIndex}
				name={columnName}
				cellRenderer={(rowIndex: number) => renderCell(rowIndex, columnIndex)}
			/>
		));
	};

	return (
		<div>
			<h5 style = {{marginBottom:8}} >
				{ !error ? 'Zone Concentrations by Species ' : 'Error Computing ITP'}
			</h5>
			<Table2 
				numRows={speciesList.length}
				loadingOptions={loadingOptions}
				enableRowHeader={false} // Disable the default row headers
				columnWidths={[120, 120, 120, 120, 120]}
			>
				{renderColumns()}
			</Table2>
		</div>
	);

};

export default ZoneConcentrationsTable;
