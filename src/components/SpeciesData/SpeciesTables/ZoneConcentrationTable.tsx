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

const columnNames = ['Species', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

const ZoneConcentrationsTable: React.FC = () => {
	const { loading, speciesDict, beanResults } = useSpeciesData();
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
		const rowData = data[rowIndex];
		switch (columnIndex) {
		case 0: return <Cell>{rowData.species}</Cell>;
		case 1: return <Cell>{truncateToThreeDecimal(rowData.zone1)}</Cell>;
		case 2: return <Cell>{truncateToThreeDecimal(rowData.zone2)}</Cell>;
		case 3: return <Cell>{truncateToThreeDecimal(rowData.zone3)}</Cell>;
		case 4: return <Cell>{truncateToThreeDecimal(rowData.zone4)}</Cell>;
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
		<Table2 
			numRows={speciesList.length}
			loadingOptions={loadingOptions}
			enableRowHeader={false} // Disable the default row headers
		>
			{renderColumns()}
		</Table2>
	);

};

export default ZoneConcentrationsTable;
