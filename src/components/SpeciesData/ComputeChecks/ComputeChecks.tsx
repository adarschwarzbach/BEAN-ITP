import React from 'react';
import { Icon } from '@blueprintjs/core';
import { Checkbox, Card } from '@blueprintjs/core';
import { useSpeciesData } from '../../../Contexts/SpeciesData';
import { SKELETON } from '@blueprintjs/core/lib/esm/common/classes';
import './ComputeChecks.css';

const ComputeChecks: React.FC = () => {
	const { beanResults, loading, error } = useSpeciesData();


	const renderStatusIcon = (condition: boolean) => {
		if (condition && !error) {
			return (
				<div style={iconBoxStyle}>
					<Icon icon={'tick'} color="#1C6E46" />
				</div>
			);
		} else {
			return (
				<div style={iconBoxStyle}>
					<Icon icon={'cross'} color="#A33A3F" />
				</div>
			);
		}
	};
	const iconBoxStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '20px',
		height: '20px',
		border: '1px solid rgba(16, 22, 26, 0.15)',  // light gray border similar to Blueprint's inputs
		borderRadius: '3px',  // slightly rounded corners
		backgroundColor: '#252A31',  // dark theme background color
		marginRight: '8px',
		flexShrink: 0  // Prevents the box from shrinking
	};

	return (
		<>
			<h5 style={{ margin: '0 0 8px 0' }}>ITP Checks</h5>
			<Card className={loading ? SKELETON : ''} style={{ padding: '10px'}}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{renderStatusIcon(beanResults.LEZoneConditionSatisfied)}
					<span style={{ marginLeft: '8px', whiteSpace:'nowrap' }}>
						{beanResults.LEZoneConditionSatisfied && !error ? 'LE zone condition is satisfied    ' : 'LE zone condition NOT satisfied'}
					</span>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width:270 }}>
					{renderStatusIcon(beanResults.AnalyteZoneConditionSatisfied)}
					<span style={{ marginLeft: '8px', whiteSpace:'nowrap' }}>
						{beanResults.AnalyteZoneConditionSatisfied && !error ? 'Analyte zone condition is satisfied      ' : 'Analyte zone condition NOT satisfied'}
					</span>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
					{renderStatusIcon(beanResults.TEZoneConditionSatisfied)}
					<span style={{ marginLeft: '8px', whiteSpace:'nowrap' }}>
						{beanResults.TEZoneConditionSatisfied && !error ? 'TE zone condition is satisfied' : 'TE zone condition NOT satisfied'}
					</span>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
					{renderStatusIcon(beanResults.StableItpPredicted)}
					<span style={{ marginLeft: '8px', whiteSpace:'nowrap' }}>
						{beanResults.StableItpPredicted && !error ? 'Stable ITP is predicted' : 'Stable ITP NOT predicted'}
					</span>
				</div>
			</Card>
		</>
	);
};

export default ComputeChecks;
