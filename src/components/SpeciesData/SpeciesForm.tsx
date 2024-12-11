import React, { useEffect, useState, useRef } from 'react';
import { Section, SectionCard, FormGroup, InputGroup } from '@blueprintjs/core';
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

	const [tooltip, setTooltip] = useState({
		show: false,
		x: 0,
		y: 0,
		content: ''
	});

	const handleTooltipShow = (e: React.MouseEvent, content: string) => {
		setTooltip({
			show: true,
			x: e.clientX + 20,
			y: e.clientY + 20,
			content
		});
	};

	const handleTooltipHide = () => {
		setTooltip({
			...tooltip,
			show: false
		});
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
							<InputGroup 
								style={{ fontSize: 12, minWidth: 20 }}
								name="valence" 
								value={rawData.valence} 
								onChange={handleChange} 
								// intent={invalidInputs.valence ? 'danger' : 'none'}
								// onMouseEnter={(e) => handleTooltipShow(e, 'Information about Valence')}
								// onMouseLeave={handleTooltipHide}
							/>
						</FormGroup>

						<FormGroup label="Mobility" style={{ flex: 1, marginRight: 20 }}>
							<InputGroup 
								style={{ fontSize: 12, color: 'white' }}
								name="mobility" 
								value={rawData.mobility} 
								onChange={handleChange} 
								intent={invalidInputs.mobility ? 'danger' : 'none'}
								onMouseEnter={(e) => handleTooltipShow(e, 'Absolute mobility at each valence, 10^-8 m²/(V.s)')}
								onMouseLeave={handleTooltipHide}
							/>
						</FormGroup>

						<FormGroup label={<span>p<span style={{ fontStyle: 'italic' }}>K</span><sub>a</sub></span>}
							style={{ flex: 1, marginRight: 20, minWidth: 48 }}
						>
							<InputGroup 
								style={{ fontSize: 12 }}
								name="pKa" 
								value={rawData.pKa} 
								onChange={handleChange} 
								intent={invalidInputs.pKa ? 'danger' : 'none'}
							/>
						</FormGroup>

						<FormGroup label="Concentration" style={{ flex: 1 }}>
							<InputGroup 
								style={{ fontSize: 12 }}
								name="concentration" 
								value={rawData.concentration} 
								onChange={handleChange} 
								intent={invalidInputs.concentration ? 'danger' : 'none'}
								onMouseEnter={(e) => handleTooltipShow(e, 'Concentration in mM (millimolar)')}
								onMouseLeave={handleTooltipHide}
							/>
						</FormGroup>
					</div>
				</SectionCard>
			</Section>
			{tooltip.show && (
				<div 
					style={{ 
						position: 'absolute', 
						left: tooltip.x, 
						top: tooltip.y,
						backgroundColor: '#394B59',  
						color: 'white',  
						padding: '10px', 
						borderRadius: '3px',  
						boxShadow: '0 0 5px rgba(0,0,0,0.2)',  
						fontSize: '13px',  
						zIndex: 9999, 
						transition: 'left 0.1s ease, top 0.1s ease', 
					}}
				>
					{tooltip.content}
				</div>
			)}
		</div>
	);
};

export default SpeciesForm;
