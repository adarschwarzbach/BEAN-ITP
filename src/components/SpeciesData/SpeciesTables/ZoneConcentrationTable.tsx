import React, {useState} from 'react';
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

const computedZoneConcentrations: number[][] = [
	[10.0, 0.0, 0.0, 0.0],
	[20.0, 16.554550572712998, 16.09768634504494, 20.0],
	[0.0, 6.540734950270157, 0.0, 0.0],
	[0.0, 0.0, 6.077203891937898, 5.0]
];

const speciesList = ['SpeciesA', 'SpeciesB', 'SpeciesC', 'SpeciesD'];

const data: SpeciesData[] = computedZoneConcentrations.map((row, index) => ({
	species: speciesList[index],
	zone1: row[0],
	zone2: row[1],
	zone3: row[2],
	zone4: row[3],
}));


function truncateToThreeDecimal(num: number): number {
	return Math.trunc(num * 1000) / 1000;
}


const columnNames = ['Species', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];


const ZoneConcentrationsTable: React.FC = () => {
	const { loading } = useSpeciesData();
	const loadingOptions = loading ? [TableLoadingOption.CELLS] : [];

	const numRows = data.length;

	const renderCell = (rowIndex: number, columnIndex: number) => {
		if (columnIndex === 0) {
			return <Cell>{`Species${rowIndex + 1}`}</Cell>; // Returns 'Species1', 'Species2', etc.
		} else {
			return <Cell>{truncateToThreeDecimal(computedZoneConcentrations[rowIndex][columnIndex - 1])}</Cell>;
		}
	};

	const renderColumns = () => {
		return columnNames.map((columnName, columnIndex) => {
			return (
				<Column
					key={columnIndex}
					name={columnName}
					cellRenderer={(rowIndex: number) => renderCell(rowIndex, columnIndex)}
				/>
			);
		});
	};

	return (
		// <div className="table-container bp5-dark">
		<Table2 
			numRows={numRows}
			loadingOptions={loadingOptions}
		>
			{renderColumns()}
		</Table2>
		// </div>
	);
};

export default ZoneConcentrationsTable;
