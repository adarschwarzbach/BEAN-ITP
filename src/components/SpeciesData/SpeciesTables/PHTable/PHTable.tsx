import React, { useState } from 'react';
import { Column, Table2, Cell, TableLoadingOption } from '@blueprintjs/table';
import '../ZoneConcentrationTable.css';
import { useSpeciesData } from '../../../../Contexts/SpeciesData';

const concentrations = [
	8.396585528437043e-09,
	4.865719840824042e-09,
	4.198872356494103e-09,
	2.5311705295064293e-09
];

function toPHValue(concentration: number): number {
	return -Math.log10(concentration);
}

const pHData = concentrations.map(toPHValue);

const columnNames = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

const PHTable: React.FC = () => {
	const { loading } = useSpeciesData();
	const loadingOptions = loading ? [TableLoadingOption.CELLS] : [];

	const numRows = 1; // We just have one row of pH values.

	const renderCell = (rowIndex: number, columnIndex: number) => {
		return <Cell>{pHData[columnIndex].toFixed(3)}</Cell>;
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
		<div className="ph-table-container">
			<Table2 
				numRows={numRows}
				loadingOptions={loadingOptions}
			>
				{renderColumns()}
			</Table2>
		</div>
	);
};

export default PHTable;
