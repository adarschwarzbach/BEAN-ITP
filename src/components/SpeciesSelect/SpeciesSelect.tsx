import commonSpeciesData from './commonSpecies.json';
import React, { useState } from 'react';
import { Select, ItemRenderer } from '@blueprintjs/select';
import { Button, MenuItem} from '@blueprintjs/core';
import './SpeciesSelect.css';

const commonSpecies = commonSpeciesData as Species[];

interface Species {
    name: string;
    valence: number[];
    mobility: number[];
    pKa: number[];
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

export const SpeciesSelect: React.FC = () => {
	const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
	const [query, setQuery] = useState<string>('');
	const [inputPlaceholder, setInputPlaceholder] = useState<string>('Choose a species...');

	const filterBySpecies = (query: string, species: Species): boolean => {
		return species.name.toLowerCase().includes(query.toLowerCase());
	};

	const handleSpeciesSelect = (species: Species) => {
		setSelectedSpecies(species);
		const displayValue = `${species.name}`;
		setInputPlaceholder(displayValue);
	};

	const createNewSpeciesFromQuery = (query: string): Species => {
		return {
			name: query,
			valence: [-1],
			mobility: [],
			pKa: [],
		};
	};

	return (
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
		>
			<Button rightIcon="exchange" minimal={true}/>
		</Select>
	);
};
export default SpeciesSelect;
