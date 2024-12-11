
import React from 'react';
import IonicEffectSwitch from '../SpeciesSelect/IonicEffectSwitch';
import BeanComputationButton from '../SpeciesSelect/BeanComputationButton';
import HeatmapComputationButton from '../SpeciesSelect/HeatmapComputationButton';
import SpeciesForm from '../SpeciesData/SpeciesForm';
import { useSpeciesData } from '../../Contexts/SpeciesData';

const DataEntry = () => {
	const { ateHeatmapLoading } = useSpeciesData();

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<div className="form-data">
				<div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
					<IonicEffectSwitch />
					<div style={{ width: '12px' }} />
					<BeanComputationButton />
					<div style={{ width: '12px' }} />
					<HeatmapComputationButton />
				</div>
				<SpeciesForm index="0" />
				<SpeciesForm index="1" />
				<SpeciesForm index="2" />
				<SpeciesForm index="3" />
			</div>
		</div>
	);
};

export default DataEntry;
