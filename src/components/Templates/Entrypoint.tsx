
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
import MobilityPlot from '../MobilityPlot/MobilityPlot';


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
				<div style = {{display:'flex', flexDirection:'column'}}>
					<HeaderBanner className={themeClass} />
					<div className={`${themeClass} app-container`} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: '0 auto', width: '100%' }}>
    
						{/* Left Half */}
						<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
							<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
								<IonicEffectSwitch />
								<BeanComputationButton />
								<HeatmapComputationButton />
							</div>
							<SpeciesForm index="0" />
							<SpeciesForm index="1" />
							<SpeciesForm index="2" />
							<SpeciesForm index="3" />
						</div>
    
						{/* Right Half */}
						<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', marginBottom: '-46px' }}>
							<ZoneConcentrationsTable />
							<div style={{height:20}} />
							<ComputeChecks />

							<div className={themeClass} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
								<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
									<SimpleHeatmap color='viridis' title='Sample Mobility Ratio' loading={ateHeatmapLoading} dataType='sample_mobility_ratio' yAxisLabel='LE concentration' xAxisLabel='Analyte Mobility'/>
									<SimpleHeatmap color='plasma' title='Sample Pre Concentration' loading={ateHeatmapLoading} dataType='sample_pre_concentration' yAxisLabel='LE concentration' xAxisLabel='TE Mobility'/>
									<SimpleHeatmap color='inferno' title='pH in Sample Region' loading={ateHeatmapLoading} dataType='ph_in_sample_region' yAxisLabel='LE concentration' xAxisLabel='CI concentration'/>
								</div>
							</div>
							<div style={{ marginTop: -20, alignSelf: 'center', justifySelf: 'center' }} />
							<div style={{ justifyContent: 'center', display: 'flex', width: '100%', marginTop: ateHeatmapLoading ? 20:0 }}>
								<ITPCheckIndicator />
							</div>
						</div>
						
    
					</div>
					<div style={{justifyContent: 'center', alignContent:'center', display:'flex' }}>
						<MobilityPlot />
					</div>
				</div>

	);
};

export default Entrypoint;