import React, { useState } from 'react';
import { Column, Table2, Cell, TableLoadingOption } from '@blueprintjs/table';
import '../ZoneConcentrationTable.css';
import { useSpeciesData } from '../../../../Contexts/SpeciesData';





const PHTable: React.FC = () => {
	const { loading, speciesDict, beanResults, error } = useSpeciesData();
	const loadingOptions = loading ? [TableLoadingOption.CELLS] : [];

	const numRows = 1; // We just have one row of pH values.

	const columnNames = Object.values(speciesDict).map(species => species.Name);

	function toPHValue(concentration: number): number {
		return -Math.log10(concentration);
	}
	
	const pHData = beanResults.cH[0].map(toPHValue);

	const renderCell = (rowIndex: number, columnIndex: number) => {
		if (error) return <Cell />;
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
		<div style = {{width: 600 }}>
			<h5 style = {{marginBottom:8}} >
				{ !error ? 'pH by species' : 'N/A'}
			</h5>
			<Table2 
				numRows={numRows}
				loadingOptions={loadingOptions}
				enableRowHeader={false} // Add this line
			>
				{renderColumns()}
			</Table2>
		</div>
	);
};

export default PHTable;
