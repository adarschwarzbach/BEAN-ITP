
import './Entrypoint.css';
import React, { useEffect} from 'react';
import HeaderBanner from '../Header/HeaderBanner';
import SpeciesForm from '../SpeciesData/SpeciesForm';
import ZoneConcentrationsTable from '../SpeciesData/SpeciesTables/ZoneConcentrationTable';
import PHTable from '../SpeciesData/SpeciesTables/PHTable/PHTable';
import HeatMap from '../HeatMap/HeatMap';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import IonicEffectSwitch from '../SpeciesSelect/IonicEffectSwitch';
import BeanComputationButton from '../SpeciesSelect/BeanComputationButton';
import SimpleHeatmap from '../HeatMap/SimpleHeatMap';
import LinedHeatMap from '../HeatMap/LinedHeatMap';
import ComputeChecks from '../SpeciesData/ComputeChecks/ComputeChecks';
import { beanComputation } from '../../Utils/beanComputation';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import { isMobile } from 'react-device-detect';
import { Button } from '@blueprintjs/core';
import HeatmapComputationButton from '../SpeciesSelect/HeatmapComputationButton';
import ITPCheckIndicator from '../HeatMap/ITPCheckIndicator';


const Entrypoint: React.FC = () => {
	const {ionicEffect, speciesDict, gloablLoading, setGlobalLoading, ateHeatmapLoading} = useSpeciesData();

	useEffect(() => {
		const fetchData = async () => {
			// Create a copy of ionicEffect 
			const ionicEffectCopy = ionicEffect;
	
			// Create a deep copy of speciesDict
			const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));
	
			const computationPromise = beanComputation(ionicEffectCopy, speciesDictCopy);
			const timeoutPromise = new Promise(resolve => setTimeout(resolve, 600));
	
			await Promise.all([computationPromise, timeoutPromise]);
	
			setGlobalLoading(false);
		};
	
		fetchData();
	}, []);

	const themeClass = 'bp5-dark';

	return (
		gloablLoading ? 
	
			<div >
				<LoadingScreen />
			</div>
			:

			isMobile ? 
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					padding: 12,
					marginTop: '-20%' // Move the content up by 10% of its parent's height
				}} className={themeClass}>
					<h3 style={{ textAlign: 'center' }}>Try a computer</h3>
					<p style={{ textAlign: 'center' }}>We do not currently support mobile. For the best BEAN experience, please try a computer :)</p>
				</div>
				:
				<>
					<HeaderBanner className={themeClass}/>
					<div className = {themeClass} style = {{display:'flex', alignItems:'center', marginRight:160, marginLeft:70}}>
						<div className={`${themeClass} app-container `} style = {{marginRight:-40}}>
							<div className={`bp5-ui-text ${themeClass}`} style={{ padding: '20px' }}>
								<div className='form-data'>
									<div style={{ display: 'flex', alignItems: 'center', alignSelf:'center' }}>
										<IonicEffectSwitch />
										<div style={{ width: '12px' }} />
										<BeanComputationButton />
										<div style={{ width: '12px' }} />
										<HeatmapComputationButton />
									</div>
									<SpeciesForm index = "0"/>
									<SpeciesForm index = "1"/>
									<SpeciesForm index = "2"/>
									<SpeciesForm index = "3"/>
								</div>
							</div>	
						</div>

						{/* <div style = {{margin:'-50px'}}/> */}
                    

						<div style = {{display:'flex', flexDirection:'column', marginBottom:-34}} className='bp5-dark'>
							<div style = {{paddingLeft:60, alignItems:'center'}}>
								<div style = {{display: 'inline-block'}}>
									<ZoneConcentrationsTable/>
								</div>
								<div style = {{height:'50px'}}/>
                            
                            
								<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'start' }}>
								
									<div style={{ display: 'inline-block', marginTop:16 }}>
										<ComputeChecks />
									</div>
									<div style={{ width: '30px' }} />
									<div style={{ display: 'inline-block' }}>
										<PHTable />
									</div>
						
								</div>

							</div>
							<div style = {{height:34}}/>
						
							<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
								
								{/* {ateHeatmapLoading ? <div style={{width:55}}/> : <></>} */}
							
								<div style = {{padding:'12px', marginLeft:10, display:'flex',  flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
									<SimpleHeatmap color='viridis' title='pH in Sample Region' loading={ateHeatmapLoading} dataType='ph_in_sample_region'  yAxisLabel='LE concentration' xAxisLabel='CI concentration'/>												
								</div>
								<div style = {{padding:'12px',}}>
									<SimpleHeatmap color='plasma' title='Sample Mobility Ratio' loading={ateHeatmapLoading} dataType='sample_mobility_ratio'  yAxisLabel='LE concentration' xAxisLabel='Analyte Mobility'/>					
								</div>
								<div style = {{padding:'12px',}}>
									<SimpleHeatmap color='inferno' title='Sample Pre Concentration' loading={ateHeatmapLoading} dataType='sample_pre_concentration'  yAxisLabel='LE concentration' xAxisLabel='TE mobility'/>					
								</div>
							
							</div>
							<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'start', alignSelf:'center', marginLeft:30 }}>
								<ITPCheckIndicator />
							</div>
						</div>
					</div>
				</>
	);
};

export default Entrypoint;