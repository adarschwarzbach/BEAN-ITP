import './App.css';
import React, { useState } from 'react';
import { InputGroup, Tooltip, Position, H5, Button, FormGroup, Intent, Switch, Divider } from '@blueprintjs/core';
import HeaderBanner from './components/Header/HeaderBanner';


const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const themeClass = isDarkMode ? 'bp5-dark' : '';

  return (
    <>
      <HeaderBanner className={themeClass}/>
    <div className={`${themeClass} app-container `}>
      <div className={`bp3-ui-text ${themeClass}`} style={{ padding: '20px' }}>
          {/* <H5>Input Details</H5>
          <Divider />
          <FormGroup
              label="Name"
              labelFor="name-input"
              helperText={<Tooltip content="The name of the compound" position={Position.RIGHT}><span>?</span></Tooltip>}
          >
              <InputGroup id="name-input" placeholder="Enter name" />
          </FormGroup>

          <FormGroup
              label="Valence"
              labelFor="valence-input"
              helperText={<Tooltip content="Valence electrons of the compound" position={Position.RIGHT}><span>?</span></Tooltip>}
          >
              <InputGroup id="valence-input" placeholder="Enter valence" type="number" />
          </FormGroup>

          <FormGroup
              label="Mobility pKa"
              labelFor="mobility-input"
              helperText={<Tooltip content="Mobility pKa value" position={Position.RIGHT}><span>?</span></Tooltip>}
          >
              <InputGroup id="mobility-input" placeholder="Enter mobility pKa" type="number" />
          </FormGroup>

          <FormGroup
              label="Concentration"
              labelFor="concentration-input"
              helperText={<Tooltip content="Concentration in the given solution" position={Position.RIGHT}><span>?</span></Tooltip>}
          >
              <InputGroup id="concentration-input" placeholder="Enter concentration" type="number" />
          </FormGroup>

          <FormGroup
              label="Type"
              labelFor="type-input"
              helperText={<Tooltip content="Type of the compound" position={Position.RIGHT}><span>?</span></Tooltip>}
          >
              <InputGroup id="type-input" placeholder="Enter type" />
          </FormGroup>

          <Button intent={Intent.PRIMARY}>Submit</Button>
          <Switch checked={isDarkMode} label="Dark Mode" onChange={() => setIsDarkMode(!isDarkMode)} style={{marginTop: '20px'}} /> */}
      </div>
    </div>
    </>
  );
}


export default App;
