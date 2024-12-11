import React from 'react';

const CustomAxisLabel = ({ xAxisLabel }) => {
	switch (xAxisLabel) {
	case 'CI concentration':
		return <span style={{ fontStyle: 'italic' }}>c<sub>LE</sub><sup>CI</sup><sub>CI</sub></span>;
	case 'Analyte Mobility':
		return <span style={{ fontStyle: 'italic' }}>μ<sup>o</sup><sub>A</sub></span>;
	case 'TE Mobility':
		return <span style={{ fontStyle: 'italic' }}>μ<sup>o</sup><sub>TI</sub></span>;
	default:
		return <span>Unknown label</span>;
	}
};

export default CustomAxisLabel;
