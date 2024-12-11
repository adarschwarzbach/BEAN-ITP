import React from 'react';
import { Column, Table2, Cell, TableLoadingOption } from '@blueprintjs/table';
import './ZoneConcentrationTable.css';
import { useSpeciesData } from '../../../Contexts/SpeciesData';

type SpeciesDataRow = {
    type: 'speciesData';
    species: string;
    zone1: number;
    zone2: number;
    zone3: number;
    zone4: number;
};

type PHRow = {
    type: 'pH';
    values: number[];
};

type BlankRow = {
    type: 'blank';
};

type TableRow = SpeciesDataRow | PHRow | BlankRow;

function toThreeSigFigs(num: number): number {
	if (num === 0) return 0;
	const magnitude = Math.floor(Math.log10(Math.abs(num)));
	const factor = Math.pow(10, 2 - magnitude); 
	return Math.round(num * factor) / factor;
}


function toPHValue(concentration: number): number {
	return -Math.log10(concentration);
}

const columnNames = ['', 'TE', 'ATE', 'Sample', 'LE'];

const ZoneConcentrationsTable: React.FC = () => {
	const { loading, speciesDict, beanResults, error } = useSpeciesData();
	const loadingOptions = loading ? [TableLoadingOption.CELLS] : [];
	const computedZoneConcentrations = beanResults?.ComputedZoneConcentrations ?? [];
	const speciesList = Object.values(speciesDict).map(species => species.Name);
	const pHData = beanResults?.pHInItpZones[0].map(toThreeSigFigs).reverse();

	const data: TableRow[] = computedZoneConcentrations.map((row, index) => ({
		type: 'speciesData', 
		species: speciesList[index],
		zone1: row[0],
		zone2: row[1],
		zone3: row[2],
		zone4: row[3],
	}));

	data.push({ type: 'blank' }); 
	if (pHData) {
		data.push({ type: 'pH', values: pHData }); 
	}

	const renderCell = (rowIndex: number, columnIndex: number): JSX.Element => {
		const rowData = data[rowIndex];

		switch (rowData.type) {
		case 'blank':
			return <Cell />; 
		case 'pH':
			if (columnIndex === 0) {
				return <Cell>pH</Cell>;
			} else {
				const phValue = rowData.values[columnIndex - 1];
				return <Cell>{phValue.toString()}</Cell>;
			}
		case 'speciesData': {
			let content = ''; 
			switch (columnIndex) {
			case 0: content = rowData.species; break;
			case 1: content = toThreeSigFigs(rowData.zone4).toString(); break; // TE
			case 2: content = toThreeSigFigs(rowData.zone3).toString(); break; // ATE
			case 3: content = toThreeSigFigs(rowData.zone2).toString(); break; // Sample
			case 4: content = toThreeSigFigs(rowData.zone1).toString(); break; // LE
			default: break;
			}
			return <Cell>{content}</Cell>;
		}
		default:
			return <Cell />;
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
			<h5 style={{ marginBottom: 8 }}>
				{!error ? <>Zone Concentrations (mM) and pH</> : 'Computation timed out. Please try new inputs.'}
			</h5>

			<Table2
				numRows={data.length}
				loadingOptions={loadingOptions}
				enableRowHeader={false}
				columnWidths={[120, 120, 120, 120, 120]}
			>
				{renderColumns()}
			</Table2>
		</div>
	);
};

export default ZoneConcentrationsTable;
