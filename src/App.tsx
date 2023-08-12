import './App.css';
import React, { useState } from 'react';
import { InputGroup, Tooltip, Position, H5, Button, FormGroup, Intent, Switch, Divider } from '@blueprintjs/core';
import HeaderBanner from './components/Header/HeaderBanner';
import SpeciesForm from './SpeciesData/SpeciesForm';


const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const themeClass = isDarkMode ? 'bp5-dark' : '';

  return (
    <>
      <HeaderBanner className={themeClass}/>
    <div className={`${themeClass} app-container `}>
      <div className={`bp3-ui-text ${themeClass}`} style={{ padding: '20px' }}>
        <div className='form-data'>
            <SpeciesForm />
            <SpeciesForm />
            <SpeciesForm />
            <SpeciesForm />
      </div>
      </div>
    </div>
    </>
  );
}


export default App;
