
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


const Entrypoint: React.FC = () => {
	const {ionicEffect, speciesDict, gloablLoading, setGlobalLoading} = useSpeciesData();

	useEffect(() => {
		const fetchData = async () => {
			// Create a copy of ionicEffect 
			const ionicEffectCopy = ionicEffect;
	
			// Create a deep copy of speciesDict
			const speciesDictCopy = JSON.parse(JSON.stringify(speciesDict));
	
			const computationPromise = beanComputation(ionicEffectCopy, speciesDictCopy);
			const timeoutPromise = new Promise(resolve => setTimeout(resolve, 800));
	
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
							<div style = {{height:24}}/>
						
							<div style = {{display:'flex', flexDirection:'row', justifyContent:'start', alignItems:'end', marginLeft:'-80'}}>
								<div style = {{padding:'12px', marginBottom:-6}}>
									<HeatMap color = 'viridis' title = 'Viridis Heatmap' key = 'viridis'/>
								</div>
							
								<div style = {{padding:'12px', marginLeft:-16}}>
									<SimpleHeatmap  color = 'gray'   title = 'Gray Heat Map'/>
								</div>
								<div style = {{padding:'12px', alignSelf:'flex-end'}}>
									<LinedHeatMap color = 'plasma' title = 'Plasma Heat Map' />
								</div>
							
							</div>
						</div>
					</div>
				</>
	);
};

export default Entrypoint;