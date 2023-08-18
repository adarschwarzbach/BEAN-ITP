import commonSpeciesData from './commonSpecies.json';
import React, { useState, useContext } from 'react';
import { Select, ItemRenderer } from '@blueprintjs/select';
import { Button, MenuItem} from '@blueprintjs/core';
import './SpeciesSelect.css';
import { useSpeciesData } from '../../Contexts/SpeciesData';

const commonSpecies = commonSpeciesData as Species[];

interface Species {
    name: string;
    valence: number[];
    mobility: number[];
    pKa: number[];
}

interface Props {
    dataIndex: string;  // This prop will determine which species in the speciesDict we are updating
}

const renderSpecies: ItemRenderer<Species> = (species, { handleClick, modifiers }) => {
	if (!modifiers.matchesPredicate) {
		return null;
	}

	return (
		<div className="bp5-dark">
			<MenuItem
				active={modifiers.active}
				key={species.name}
				onClick={handleClick}
				text={
					<>
						{species.name}
						<div style={{ fontSize: 'smaller' }}>
						Valence: {species.valence.join(', ')}
							{' | '}
                        Mobility: {species.mobility.join(', ')}
							{' | '}
                        pKa: {species.pKa.join(', ')}
						</div>
					</>
				}
				style = {{backgroundColor: '#2F343C', }}

			/>
		</div>
	);
};

export const SpeciesSelect: React.FC<Props> = ({dataIndex}) => {
	const { speciesDict, setSpeciesDict } = useSpeciesData(); // Extract values from context
	const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
	const [query, setQuery] = useState<string>('');
	const [inputPlaceholder, setInputPlaceholder] = useState<string>('Choose a species...');

	const filterBySpecies = (query: string, species: Species): boolean => {
		return species.name.toLowerCase().includes(query.toLowerCase());
	};

	const createNewSpeciesFromQuery = (query: string): Species => {
		return {
			name: query,
			valence: [],
			mobility: [],
			pKa: [],
		};
	};

	const handleSpeciesSelect = (species: Species) => {
		setSelectedSpecies(species);
	
		// Deep copy of the speciesDict
		const updatedSpeciesDict = JSON.parse(JSON.stringify(speciesDict));
	
		// Find the species data from commonSpecies
		const existingSpeciesData = commonSpecies.find(s => s.name === species.name);
	
		if (existingSpeciesData) {
			updatedSpeciesDict[dataIndex] = {
				...updatedSpeciesDict[dataIndex],
				...existingSpeciesData,
				Name: existingSpeciesData.name,  // Adjust this based on your Species interface naming
			};
		} else {
			updatedSpeciesDict[dataIndex] = {
				...updatedSpeciesDict[dataIndex],
				Name: species.name,
				pKa: [],  // Resetting pKa, mobility, valence
				mobility: [],
				valence: []
			};
		}
	
		// Update the speciesDict state
		setSpeciesDict(updatedSpeciesDict);
	
		const displayValue = `${species.name}`;
		setInputPlaceholder(displayValue);
	};
	
	
	

	return (
		<div onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
			<Select
				className="my-custom-class"
				items={commonSpecies}
				itemRenderer={renderSpecies}
				itemPredicate={filterBySpecies}
				onItemSelect={handleSpeciesSelect}
				noResults={<MenuItem disabled={true} text="No results." />}
				onQueryChange={(newQuery) => setQuery(newQuery)}
				query={query}
				filterable={true}
				inputProps={{
					placeholder: inputPlaceholder,
					className: 'bp5-dark my-input',
					style: {backgroundColor: '#1C2127', color: 'white'}
				}}
				createNewItemFromQuery={createNewSpeciesFromQuery}
				createNewItemRenderer={(query, active, handleClick) => (
					<MenuItem
						icon="add"
						text={`Create "${query}"`}
						active={active}
						onClick={handleClick}
						shouldDismissPopover={false}
						style = {{color: 'white', }}
					/>
				)}
				activeItem={null}  // Set the active item to null
			>
				<Button rightIcon="exchange" minimal={true} />
			</Select>
		</div>
	);
    
};
export default SpeciesSelect;
