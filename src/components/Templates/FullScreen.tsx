import React from 'react';
import Entrypoint from './Entrypoint'; 
import DataDisplayTemplate from './DataDisplayTemplate';

const FullScreen = () => {
	return (
		<div style={{ display: 'flex', height: '100vh', width: '100%' }}>
			<div style={{ flex: 1, padding: '20px' }}>
				<Entrypoint />
			</div>
			<div style={{ flex: 1, padding: '20px' }}>
				<DataDisplayTemplate />
			</div>
		</div>
	);
};

export default FullScreen;
