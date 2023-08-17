import React from 'react';
import { Checkbox, Card } from '@blueprintjs/core';
import { useSpeciesData } from '../../../Contexts/SpeciesData';
import { SKELETON } from '@blueprintjs/core/lib/esm/common/classes';
import './ComputeChecks.css';

const ComputeChecks: React.FC = () => {
	const { beanResults, loading, error } = useSpeciesData();

	return (
		<>
			<h5 style={{ margin: '0 0 8px 0' }}>Check Results:</h5>
			<Card className={loading ? SKELETON : ''} style={{ padding: '12px', paddingBottom:4, width: 'fit-content' }}>
				{/* <div style={{ display: 'flex', justifyContent: 'start', marginBottom: '10px' }}> */}
				<Checkbox 
					checked={beanResults.LEZoneConditionSatisfied && !error} 
					label="LE zone condition is satisfied" 
					disabled={true} 
				/>
				<div style={{ width: '20px' }} />
				<Checkbox 
					checked={beanResults.AnalyteZoneConditionSatisfied  && !error} 
					label="Analyte zone condition is satisfied" 
					disabled={true}
				/>
				{/* </div> */}
				{/* <div style={{ display: 'flex', justifyContent: 'start', marginTop: '10px' }}> */}
				<Checkbox 
					checked={beanResults.TEZoneConditionSatisfied  && !error} 
					label="TE zone condition is satisfied" 
					disabled={true}
				/>
				<div style={{ width: '20px' }} />
				<Checkbox 
					checked={beanResults.StableItpPredicted && !error} 
					label="Stable ITP is predicted" 
					disabled={true}
				/>
				{/* </div> */}
			</Card>
		</>
	);
};

export default ComputeChecks;
