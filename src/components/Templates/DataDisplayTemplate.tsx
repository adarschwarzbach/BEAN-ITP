import React, { useEffect } from 'react';
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

const DataDisplayTemplate: React.FC = () => {
	const { ionicEffect, speciesDict, gloablLoading, setGlobalLoading, ateHeatmapLoading } = useSpeciesData();

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
	}, [ionicEffect, speciesDict, setGlobalLoading]);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', marginBottom: -34 }} className='bp5-dark'>
			{/* Other component rendering removed for brevity */}
			<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ padding: '12px', marginLeft: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					<SimpleHeatmap color='viridis' title='pH in Sample Region' loading={ateHeatmapLoading} dataType='ph_in_sample_region' yAxisLabel='LE concentration' xAxisLabel='CI concentration'/>
				</div>
				<div style={{ padding: '12px', }}>
					<SimpleHeatmap color='plasma' title='Sample Mobility Ratio' loading={ateHeatmapLoading} dataType='sample_mobility_ratio' yAxisLabel='LE concentration' xAxisLabel='Analyte Mobility'/>
				</div>
				<div style={{ padding: '12px', }}>
					<SimpleHeatmap color='inferno' title='Sample Pre Concentration' loading={ateHeatmapLoading} dataType='sample_pre_concentration' yAxisLabel='LE concentration' xAxisLabel='TE Mobility'/>
				</div>
			</div>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'start', alignSelf: 'center', marginLeft: 30 }}>
				<ITPCheckIndicator />
			</div>
		</div>
	);
};

export default DataDisplayTemplate;
