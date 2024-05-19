import React, { useEffect, useState, useRef } from 'react';
import { Section, SectionCard, FormGroup, InputGroup, Tooltip } from '@blueprintjs/core';
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

const typeLabels = {
	'LE': 'Leading ion (LI)',
	'Background': 'Counter-ion (CI)',
	'Analyte': 'Analyte (A)',
	'TE': 'Trailing ion (TI)'
};

const getTypeLabel = (type) => typeLabels[type] || type; // Fallback to type if not found

const SpeciesForm: React.FC<Props> = ({ index }) => {
	const { speciesDict, setSpeciesDict, validInput, setValidInput } = useSpeciesData();
	const speciesData = speciesDict[index];

	const [rawData, setRawData] = useState<Record<string, string>>({
		valence: speciesData.valence.join(', '),
		mobility: speciesData.mobility.join(', '),
		pKa: speciesData.pKa.join(', '),
		concentration: speciesData.concentration.toString(),
	});

	const externalUpdateRef = useRef(true);

	useEffect(() => {
		if (speciesDict[index] && externalUpdateRef.current) {
			const updatedData = {
				valence: speciesDict[index].valence.join(', '),
				mobility: speciesDict[index].mobility.join(', '),
				pKa: speciesDict[index].pKa.join(', '),
				concentration: speciesDict[index].concentration.toString(),
			};

			setRawData(updatedData);

			const areOthersEmpty = !updatedData.valence && !updatedData.mobility && !updatedData.pKa;
			const newInvalidInputs = {
				valence: !updatedData.valence,
				mobility: !updatedData.mobility,
				pKa: !updatedData.pKa,
				concentration: areOthersEmpty || !updatedData.concentration,
			};

			if (areOthersEmpty && updatedData.concentration) {
				setRawData(prevData => ({ ...prevData, concentration: '' }));
				setValidInput(false);
			}

			setInvalidInputs(newInvalidInputs);
		}

		externalUpdateRef.current = true;

	}, [speciesDict, index]);

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
					setValidInput(false);
				}
				return num;
			});

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

		externalUpdateRef.current = false;
		const allValid = Object.values(invalidInputs).every(validity => !validity);
		setValidInput(allValid);
	};

	return (
		<div style={{ margin: 4 }}>
			<Section 
				collapsible={false}
				compact={true}
				title={speciesData.Name}
				subtitle={`Type: ${getTypeLabel(speciesData.type)}`}
				elevation={1}
				rightElement={
					<SpeciesSelect dataIndex={index} />
				}
			>
				<SectionCard padded={true} className='background-override'>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
						<FormGroup label="Valence" style={{ flex: 1, marginRight: 20 }}>
							<Tooltip content="Information about Valence" placement="bottom" isOpen={false}>
								<InputGroup 
									style={{ fontSize: 12, minWidth: 20 }}
									name="valence" 
									value={rawData.valence} 
									onChange={handleChange} 
									intent={invalidInputs.valence ? 'danger' : 'none'}
									
								/>
							</Tooltip>
						</FormGroup>

						<FormGroup label="Mobility" style={{ flex: 1, marginRight: 20 }}>
							<Tooltip content='Absolute mobility at each valence, 10^-8 m²/(V.s)' placement="bottom">
								<InputGroup 
									style={{ fontSize: 12, color:'white' }}
									name="mobility" 
									value={rawData.mobility} 
									onChange={handleChange} 
									intent={invalidInputs.mobility ? 'danger' : 'none'}
								/>
							</Tooltip>
						</FormGroup>

						<FormGroup label={<span>p<span style={{ fontStyle: 'italic' }}>K</span><sub>a</sub></span>}
							style={{ flex: 1, marginRight: 20, minWidth: 48 }}
						>
							<Tooltip content="Information about pKa" placement="bottom" isOpen={false}>
								<InputGroup 
									style={{ fontSize: 12 }}
									name="pKa" 
									value={rawData.pKa} 
									onChange={handleChange} 
									intent={invalidInputs.pKa ? 'danger' : 'none'}
								/>
							</Tooltip>
						</FormGroup>

						<FormGroup label="Concentration" style={{ flex: 1 }}>
							<Tooltip content="Concentration in mM (millimolar)" placement="bottom">
								<InputGroup 
									style={{ fontSize: 12 }}
									name="concentration" 
									value={rawData.concentration} 
									onChange={handleChange} 
									intent={invalidInputs.concentration ? 'danger' : 'none'}
								/>
							</Tooltip>
						</FormGroup>
					</div>
				</SectionCard>
			</Section>
		</div>
	);
};

export default SpeciesForm;
