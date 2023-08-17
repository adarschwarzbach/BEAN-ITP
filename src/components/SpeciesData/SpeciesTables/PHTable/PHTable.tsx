import React from 'react';
import { Table2, Cell, TableLoadingOption, Column } from '@blueprintjs/table';
import '../ZoneConcentrationTable.css';
import { useSpeciesData } from '../../../../Contexts/SpeciesData';

const PHTable: React.FC = () => {
	const { loading, beanResults, error, speciesDict } = useSpeciesData();
	const loadingOptions = loading ? [TableLoadingOption.CELLS] : [];

	const numRows = 4;

	function toPHValue(concentration: number): number {
		return -Math.log10(concentration);
	}

	const pHData = beanResults.cH[0].map(toPHValue);

	const renderCell = (rowIndex: number, columnIndex: number) => {
		if (error) return <Cell />;
        
		switch(columnIndex) {
		case 0: return <Cell>{Object.values(speciesDict)[rowIndex].Name}</Cell>;
		case 1: return <Cell>{pHData[rowIndex].toFixed(3)}</Cell>;
		default: return <Cell />;
		}
	};

	return (
		<div style={{width: 300}}>
			<h5 style = {{marginBottom:8}} >
				{ !error ? 'pH by Species' : 'N/A'}
			</h5>
			<Table2 
				numRows={numRows}
				loadingOptions={loadingOptions}
				enableRowHeader={false}
				columnWidths={[150, 150]}
			>
				<Column 
					name="Species" 
					cellRenderer={(rowIndex: number) => renderCell(rowIndex, 0)}
				/>
				<Column 
					name="pH" 
					cellRenderer={(rowIndex: number) => renderCell(rowIndex, 1)}
				/>
			</Table2>
		</div>
	);
};

export default PHTable;
