import React from 'react';

const ITPCheckIndicator = () => {
	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'center', marginTop: '12px', fontSize: '12px', lineHeight: '20px', justifyContent:'center' }}>
				<div style={{ width: '14px', height: '14px', backgroundColor: 'white', marginRight: '10px' }}></div>
				<p style={{ margin: 0 }}>Indicates a condition where ITP checks are not satisfied (e.g., sample does not focus between LE and TE)</p>
			</div>
		
			<div style={{ display: 'flex', alignItems: 'center', marginTop: '2', fontSize: '12px', lineHeight: '20px' }}>
				<div style={{ width: '14px', height: '14px', backgroundColor: '#A9A9A9', marginRight: '10px' }}></div>
				<p style={{ margin: 0 }}>Indicates a condition where the ITP calculation timed out (needed too much time to converge)</p>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', marginTop: '2', fontSize: '12px', lineHeight: '20px' }}>
				<div style={{
					width: '14px',
					height: '14px',
					fontWeight:700,
					backgroundColor: '#A9A9A9',
					marginRight: '10px',
					display: 'flex',
					alignItems: 'center', // Vertically center the content
					justifyContent: 'center', // Horizontally center the content
					fontSize: '16px', // Adjust as needed to make the dash larger
					color: 'white', // Adjust the color of the dash if needed
				}}>
					–
				</div>
				<p style={{ margin: 0 }}>Indicates a condition where the chemical equilibrium calculation did not converge within 2000 iterations</p>
			</div>
		</div>
	);
};

export default ITPCheckIndicator;
