import React from 'react';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

const MobilityPlot = () => {
	const { mobilityData, speciesDict } = useSpeciesData();

	const { lin_pH = [], sol1 = [] } = mobilityData || {};
	const labels = Object.values(speciesDict || {}).map(species => species.Name);

	if (!Array.isArray(lin_pH) || !Array.isArray(sol1) || !lin_pH.length || !sol1.length) {
		console.error('Invalid data for MobilityPlot:', { lin_pH, sol1 });
		return <div>Error loading data. Please check the console for more details.</div>;
	}

	const datasets = sol1.map((sol, index) => ({
		label: labels[index] || `Species ${index + 1}`,
		data: sol.map((y, i) => ({ x: lin_pH[i], y: y * 1e8 })),
		borderColor: `hsl(${(index / sol1.length) * 360}, 100%, 50%)`,
		backgroundColor: `hsl(${(index / sol1.length) * 360}, 100%, 50%, 0)`, // fully transparent background
		fill: false,
		tension: 0.1,
		borderWidth: 0.5, // Ultra-thin lines
	}));
    

	const data = { datasets };

	const options = {
		scales: {
			x: {
				type: 'linear',
				position: 'bottom',
				title: {
					display: true,
					text: 'pH'
				}
			},
			y: {
				title: {
					display: true,
					text: 'μX [10^-8 m²/(V⋅s)]'
				}
			}
		},
		plugins: {
			legend: {
				display: true,
				position: 'top',
			},
		},
		maintainAspectRatio: false,
		// Responsive: true, // Optional: if you want the chart to be responsive
	};

	return (
		<div style={{ width: '800px', height: '600px' }}> {/* Adjust the size as needed */}
			<Line data={data} options={options} />
		</div>
	);
};

export default MobilityPlot;
