import './App.css';
import React, { useState } from 'react';
import HeaderBanner from './components/Header/HeaderBanner';
import SpeciesForm from './components/SpeciesData/SpeciesForm';
import ZoneConcentrationsTable from './components/SpeciesData/SpeciesTables/ZoneConcentrationTable';
import PHTable from './components/SpeciesData/SpeciesTables/PHTable/PHTable';
import HeatMap from './components/HeatMap/HeatMap';
import SpeciesSelect from './components/SpeciesSelect/SpeciesSelect';
import { DataProvider } from './Contexts/SpeciesData';
import IonicEffectSwitch from './components/SpeciesSelect/IonicEffectSwitch';
import BeanComputationButton from './components/SpeciesSelect/BeanComputationButton';
const App: React.FC = () => {
	const themeClass = 'bp5-dark';

	return (
		<DataProvider>
			<>
				<HeaderBanner className={themeClass}/>
				<div className = {themeClass} style = {{display:'flex', alignItems:'center', marginRight:'12px'}}>
					<div className={`${themeClass} app-container `}>
						<div className={`bp5-ui-text ${themeClass}`} style={{ padding: '20px' }}>
							<div className='form-data'>
								<div style={{ display: 'flex', alignItems: 'center', alignSelf:'center' }}>
									<BeanComputationButton />
									<div style={{ width: '12px' }} />
									<IonicEffectSwitch />
								</div>
								<SpeciesForm index = "0"/>
								<SpeciesForm index = "1"/>
								<SpeciesForm index = "2"/>
								<SpeciesForm index = "3"/>
							</div>
						</div>	
					</div>
					<div style = {{display:'flex', flexDirection:'column'}} className='bp5-dark'>
						<ZoneConcentrationsTable/>
						<div style = {{height:'12px'}}/>
						<PHTable/>
						<HeatMap/>
					</div>
				</div>
			</>
		</DataProvider>
	);
};


export default App;
