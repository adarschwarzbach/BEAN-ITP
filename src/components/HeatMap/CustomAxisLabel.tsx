import React from 'react';

const CustomAxisLabel = ({ xAxisLabel }) => {
	switch (xAxisLabel) {
	case 'CI concentration':
		// Corrected structure for nested sub and sup tags
		return <span style={{ fontStyle: 'italic' }}>c<sub>LE</sub><sup>CI</sup><sub>CI</sub></span>;
	case 'Analyte Mobility':
		// For Analyte Mobility, μ in italics, super o, sub A (all in italics)
		return <span style={{ fontStyle: 'italic' }}>μ<sup>o</sup><sub>A</sub></span>;
	case 'TE Mobility':
		// For TE Mobility, μ in italics, super o, sub TI (both in italics)
		return <span style={{ fontStyle: 'italic' }}>μ<sup>o</sup><sub>TI</sub></span>;
	default:
		// Default case if none of the cases match
		return <span>Unknown label</span>;
	}
};

export default CustomAxisLabel;
