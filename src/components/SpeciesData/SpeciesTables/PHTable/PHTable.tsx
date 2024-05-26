import React from 'react';
import { Table2, Cell, TableLoadingOption, Column } from '@blueprintjs/table';
import '../ZoneConcentrationTable.css';
import { useSpeciesData } from '../../../../Contexts/SpeciesData';

const PHTable: React.FC = () => {
	const { loading, beanResults, error, speciesDict } = useSpeciesData();
	const loadingOptions = loading ? [TableLoadingOption.CELLS] : [];

	const numRows = 4;

	function toPHValue(concentration: number): number {
		console.log('ph', -Math.log10(concentration));
		return -Math.log10(concentration);
	}

	const pHData = beanResults.cH[0].map(toPHValue);

	function toTwoSigFigs(num: number): number {
		const magnitude = Math.floor(Math.log10(Math.abs(num)));
		const factor = Math.pow(10, magnitude - 1);
		return Math.round(num / factor) * factor;
	}

	const zones = ['LE', 'Sample', 'ATE', 'TE'];

	const renderCell = (rowIndex: number, columnIndex: number) => {
		if (error) return <Cell />;

        
		switch(columnIndex) {
		case 0: return <Cell>{Object.values(zones)[rowIndex]}</Cell>;
		case 1: return <Cell>{toTwoSigFigs(pHData[rowIndex]).toFixed(1)}</Cell>;
		default: return <Cell />;
		}
	};

	return (
		<div style={{width: 280}}>
			<h5 style = {{marginBottom:8}} >
				{ !error ? 'pH by Zone' : 'Error Computing ITP'}
			</h5>
			<Table2 
				numRows={numRows}
				loadingOptions={loadingOptions}
				enableRowHeader={false}
				columnWidths={[140, 140]}
			>
				<Column 
					name="Zone" 
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
