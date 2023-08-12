import React, { useState } from 'react';
import { Section,SectionCard, FormGroup, InputGroup, Button, Divider, Tooltip, Position } from "@blueprintjs/core";
import './SpeciesForm.css';

const SpeciesForm: React.FC = () => {
    const [formData, setFormData] = useState({
        species: 'HCl',
        valence: '-1',
        mobility: '-7.91e-8',
        pKa: '-2',
        concentration: '0.01',
        type: 'LE'
    });

    const [valenceTooltipOpen, setValenceTooltipOpen] = useState(false);
    const [mobilityTooltipOpen, setMobilityTooltipOpen] = useState(false);
    const [pKaTooltipOpen, setPkaTooltipOpen] = useState(false);
    const [concentrationTooltipOpen, setConcentrationTooltipOpen] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <div style = {{margin:4}}>
        <Section 
            collapsible = {true}
            compact = {true}
            title = {formData.species}
            subtitle={`Type: ${formData.type}`}
            elevation={1}
            rightElement={
                <Button
                    minimal={true}
                    intent="none"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('clicked');
                    }}
                    // text="Change"
                    icon = "exchange"
                />
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
                <InputGroup name="valence" value={formData.valence} onChange={handleChange} />
            </FormGroup>
        </Tooltip>

        <Tooltip 
            content="Information about Mobility" 
            isOpen={mobilityTooltipOpen}
            onInteraction={(nextOpen) => setMobilityTooltipOpen(nextOpen)}
            position={Position.BOTTOM}
        >
            <FormGroup label="Mobility" style={{ flex: 1, marginRight: 20 }}>
                <InputGroup name="mobility" value={formData.mobility} onChange={handleChange} />
            </FormGroup>
        </Tooltip>

        <Tooltip 
            content="Information about pKa" 
            isOpen={pKaTooltipOpen}
            onInteraction={(nextOpen) => setPkaTooltipOpen(nextOpen)}
            position={Position.BOTTOM}
        >
            <FormGroup label="pKa" style={{ flex: 1, marginRight: 20 }}>
                <InputGroup name="pKa" value={formData.pKa} onChange={handleChange} />
            </FormGroup>
        </Tooltip>

        <Tooltip 
            content="Information about Concentration" 
            isOpen={concentrationTooltipOpen}
            onInteraction={(nextOpen) => setConcentrationTooltipOpen(nextOpen)}
            position={Position.BOTTOM}
        >
            <FormGroup label="Concentration" style={{ flex: 1 }}>
                <InputGroup name="concentration" value={formData.concentration} onChange={handleChange} />
            </FormGroup>
        </Tooltip>
    </div>
            </SectionCard>
        </Section>
        </div>
    );
}

export default SpeciesForm;
