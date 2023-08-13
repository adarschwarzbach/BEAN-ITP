import './App.css';
import React, { useState } from 'react';
import HeaderBanner from './components/Header/HeaderBanner';
import SpeciesForm from './SpeciesData/SpeciesForm';
import ZoneConcentrationsTable from './SpeciesData/SpeciesTables/ZoneConcentrationTable';
const App: React.FC = () => {
	const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
	const themeClass = isDarkMode ? 'bp5-dark' : '';

	return (
		<>
			<HeaderBanner className={themeClass}/>
			<div className = {themeClass} style = {{display:'flex', alignItems:'center', marginRight:'12px'}}>
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
				<ZoneConcentrationsTable/>
			</div>
		</>
	);
};


export default App;
