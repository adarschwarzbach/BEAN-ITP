import React from 'react';

const ITPCheckIndicator = () => {
	return (
		<div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', fontSize: '12px', lineHeight: '20px' }}>
			<div style={{ width: '14px', height: '14px', backgroundColor: 'white', marginRight: '10px' }}></div>
			<p style={{ margin: 0 }}>Indicates a condition where ITP checks are not satisfied (e.g., sample does not focus between LE and TE)</p>
		</div>
	);
};

export default ITPCheckIndicator;
