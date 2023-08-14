import commonSpeciesData from './commonSpecies.json';
import React, { useState } from 'react';
import { Suggest, ItemRenderer, ItemPredicate } from '@blueprintjs/select';
import { Button, InputGroup, MenuItem, Popover, Position } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';

const commonSpecies = commonSpeciesData as Species[];

interface Species {
    name: string;
    valence: number[];
    mobility: number[];
    pKa: number[];
}

export const SpeciesSelect: React.FC = () => {
	const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

	const filterBySpecies: ItemPredicate<Species> = (query, species) => {
		return species.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
	};

	const renderSpecies: ItemRenderer<Species> = (species, { handleClick, modifiers }) => {
		if (!modifiers.matchesPredicate) {
			return null;
		}

		return (
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
				className="bp5-dark"
			/>
		);
	};

	return (
		<div className="bp5-dark">
			<Popover
				content={
                    
					<>
						<Suggest
							items={commonSpecies}
							itemRenderer={renderSpecies}
							itemPredicate={filterBySpecies}
							onItemSelect={item => setSelectedSpecies(item)}
							inputProps={{ 
								placeholder: 'Choose a species...', 
								className: 'bp5-dark my-input', 
								style: {backgroundColor: '#1C2127'}
							}}
							inputValueRenderer={(species: Species) => `${species.name} - Valence: ${species.valence.join(', ')}, Mobility: ${species.mobility.join(', ')}, pKa: ${species.pKa.join(', ')}`}
							noResults={<MenuItem className="bp5-dark" disabled={true} text="No results." />}
							className="bp5-dark"

						/>
					</>
				}
				position={Position.BOTTOM}
			>
				<Button icon = "exchange" minimal={true} />
			</Popover>
		</div>
	);
};
