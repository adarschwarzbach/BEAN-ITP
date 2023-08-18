import React, { useEffect, useState } from 'react';
import { Section, SectionCard, FormGroup, InputGroup, Tooltip, Position } from '@blueprintjs/core';
import './SpeciesForm.css';
import SpeciesSelect from '../SpeciesSelect/SpeciesSelect';
import { useSpeciesData } from '../../Contexts/SpeciesData';

interface SpeciesData {
    Name: string;
    valence: number[];
    mobility: number[];
    pKa: number[];
    concentration: number;
    type: string;
}

interface Props {
    index: string;
}

const SpeciesForm: React.FC<Props> = ({ index }) => {
	const { speciesDict, setSpeciesDict, validInput, setValidInput } = useSpeciesData();
	const speciesData = speciesDict[index];

	const [rawData, setRawData] = useState<Record<string, string>>({
		valence: speciesData.valence.join(', '),
		mobility: speciesData.mobility.join(', '),
		pKa: speciesData.pKa.join(', '),
		concentration: speciesData.concentration.toString(),
	});

	// useEffect(() => {
	// 	setRawData({
	// 		valence: speciesData.valence.join(', '),
	// 		mobility: speciesData.mobility.join(', '),
	// 		pKa: speciesData.pKa.join(', '),
	// 		concentration: speciesData.concentration.toString(),
	// 	});
	// }, [speciesData]);

	const [valenceTooltipOpen, setValenceTooltipOpen] = useState(false);
	const [mobilityTooltipOpen, setMobilityTooltipOpen] = useState(false);
	const [pKaTooltipOpen, setPkaTooltipOpen] = useState(false);
	const [concentrationTooltipOpen, setConcentrationTooltipOpen] = useState(false);

	const [invalidInputs, setInvalidInputs] = useState<Record<string, boolean>>({
		valence: false,
		mobility: false,
		pKa: false,
		concentration: false
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		let isInvalid = false;
	
		if (name === 'valence' || name === 'mobility' || name === 'pKa') {
			const numbers = value.split(',').map(v => {
				const num = parseFloat(v.trim());
				if (isNaN(num)) {
					isInvalid = true;
				}
				return num;
			});
	
			// For mobility, store value as-is without multiplying by 1e-8
			setRawData(prevRawData => ({
				...prevRawData,
				[name]: value
			}));
		} else if (name === 'concentration') {
			isInvalid = value.includes(',') || isNaN(parseFloat(value));
	
			setRawData(prevRawData => ({
				...prevRawData,
				concentration: value
			}));
		}
	
		setInvalidInputs(prevInvalid => {
			const updatedInvalidInputs = {
				...prevInvalid,
				[name]: isInvalid
			};
	
			const allValid = Object.values(updatedInvalidInputs).every(validity => !validity);
			setValidInput(allValid);
	
			return updatedInvalidInputs;
		});
	
		setSpeciesDict(prevDict => {
			const updatedDict = { ...prevDict };
			if (!isInvalid) {
				if (name === 'valence' || name === 'mobility' || name === 'pKa') {
					updatedDict[index][name] = value.split(',').map(v => parseFloat(v.trim()));
				} else if (name === 'concentration') {
					updatedDict[index][name] = parseFloat(value);
				}
			}
			return updatedDict;
		});
	};

	return (
		<div style = {{margin:4}}>
			<Section 
				collapsible = {false}
				compact = {true}
				title ={speciesData.Name}
				subtitle={`Type: ${speciesData.type}`}
				elevation={1}
				rightElement={
					<SpeciesSelect dataIndex={index}/>
				}
			>
				<SectionCard padded = {true} className='background-override'>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
						<Tooltip 
							content="Information about Valence" 
							isOpen={valenceTooltipOpen}
							onInteraction={(nextOpen) => setValenceTooltipOpen(nextOpen)}
							position={Position.BOTTOM}
						>
							<FormGroup label="Valence" style={{ flex: 1, marginRight: 20 }}>
								<InputGroup 
									style = {{fontSize: 12, minWidth: 20}}
									name="valence" 
									value={rawData.valence} 
									onChange={handleChange} 
									intent={invalidInputs.valence ? 'danger' : 'none'}
								/>
							</FormGroup>
						</Tooltip>

						<Tooltip 
							content="Absolute mobility at each valence, 10^-8 m²/(V.s)" 
							isOpen={mobilityTooltipOpen}
							onInteraction={(nextOpen) => setMobilityTooltipOpen(nextOpen)}
							position={Position.BOTTOM}
						>
							<FormGroup label="Mobility" style={{ flex: 1, marginRight: 20 }}>
								<InputGroup 
									style = {{fontSize: 12,}}
									name="mobility" 
									value={rawData.mobility} 
									onChange={handleChange} 
									intent={invalidInputs.mobility ? 'danger' : 'none'}
								/>
							</FormGroup>
						</Tooltip>

						<Tooltip 
							content="Information about pKa" 
							isOpen={pKaTooltipOpen}
							onInteraction={(nextOpen) => setPkaTooltipOpen(nextOpen)}
							position={Position.BOTTOM}
						>
							<FormGroup label="pKa" style={{ flex: 1, marginRight: 20, minWidth:48 }}>
								<InputGroup 
									style = {{fontSize: 12,}}
									name="pKa" 
									value={rawData.pKa} 
									onChange={handleChange} 
									intent={invalidInputs.pKa ? 'danger' : 'none'}
								/>
							</FormGroup>
						</Tooltip>

						<Tooltip 
							content="Information about Concentration" 
							isOpen={concentrationTooltipOpen}
							onInteraction={(nextOpen) => setConcentrationTooltipOpen(nextOpen)}
							position={Position.BOTTOM}
						>
							<FormGroup label="Concentration" style={{ flex: 1 }}>
								<InputGroup 
									style = {{fontSize: 12,}}
									name="concentration" 
									value={rawData.concentration} 
									onChange={handleChange} 
									intent={invalidInputs.concentration ? 'danger' : 'none'}
								/>
							</FormGroup>
						</Tooltip>
					</div>
				</SectionCard>
			</Section>
		</div>
	);
};

export default SpeciesForm;
