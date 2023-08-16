import './App.css';
import React, { useState } from 'react';
import HeaderBanner from './components/Header/HeaderBanner';
import SpeciesForm from './components/SpeciesData/SpeciesForm';
import ZoneConcentrationsTable from './components/SpeciesData/SpeciesTables/ZoneConcentrationTable';
import PHTable from './components/SpeciesData/SpeciesTables/PHTable/PHTable';
import HeatMap from './components/HeatMap/HeatMap';
import { DataProvider } from './Contexts/SpeciesData';
import IonicEffectSwitch from './components/SpeciesSelect/IonicEffectSwitch';
import BeanComputationButton from './components/SpeciesSelect/BeanComputationButton';
import GrayHeatMap from './components/HeatMap/SimpleHeatMap';
import SimpleHeatmap from './components/HeatMap/SimpleHeatMap';
import LinedHeatMap from './components/HeatMap/LinedHeatMap';

const App: React.FC = () => {
	const themeClass = 'bp5-dark';

	return (
		<DataProvider>
			<>
				<HeaderBanner className={themeClass}/>
				<div className = {themeClass} style = {{display:'flex', alignItems:'center', marginRight:'140px'}}>

					<div className={`${themeClass} app-container `}>
						<div className={`bp5-ui-text ${themeClass}`} style={{ padding: '20px' }}>
							<div className='form-data'>
								<div style={{ display: 'flex', alignItems: 'center', alignSelf:'center' }}>
									<IonicEffectSwitch />
									<div style={{ width: '12px' }} />
									<BeanComputationButton />
								</div>
								<SpeciesForm index = "0"/>
								<SpeciesForm index = "1"/>
								<SpeciesForm index = "2"/>
								<SpeciesForm index = "3"/>
							</div>
						</div>	
					</div>
					<div style = {{margin:'-40px'}}/>

					<div style = {{display:'flex', flexDirection:'column', paddingBottom:100}} className='bp5-dark'>
						<div style = {{paddingLeft:60}}>
							<ZoneConcentrationsTable/>
							<div style = {{height:'12px'}}/>
							<PHTable/>
						</div>
						
						<div style = {{display:'flex', flexDirection:'row', justifyContent:'start', alignItems:'end', marginLeft:'-80'}}>
							<div style = {{padding:'12px'}}>
								<HeatMap color = 'viridis' title = 'Viridis Heatmap' key = 'viridis'/>
							</div>
							
							<div style = {{padding:'12px'}}>
								<SimpleHeatmap  color = 'gray'   title = 'Gray Heat Map'/>
							</div>
							<div style = {{padding:'12px', alignSelf:'flex-end'}}>
								<LinedHeatMap color = 'plasma' title = 'Plasma Heat Map' />
							</div>
							
						</div>
					</div>
				</div>
			</>
		</DataProvider>
	);
};


export default App;
