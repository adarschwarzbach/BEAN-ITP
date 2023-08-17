import React from 'react';
import { Spinner } from '@blueprintjs/core';
import './LoadingScreen.css';

const LoadingScreen: React.FC = () => {
	return (
		<div className="loading-screen-container" >
			<img src={require('./stanford_logo_black.png')} alt="Loading" className="loading-image" />
			<Spinner size={80} intent = 'none'/>
			<div style = {{height:40}}/>
		</div>
	);
};

export default LoadingScreen;