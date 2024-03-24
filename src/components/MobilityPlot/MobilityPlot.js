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

	const { lin_pH = [], sol1 = [], sol2 = [] } = mobilityData || {};
	const labels = Object.values(speciesDict || {}).map(species => species.Name);

	if (!Array.isArray(lin_pH) || !Array.isArray(sol1) || !Array.isArray(sol2) || !lin_pH.length || !sol1.length || !sol2.length) {
		console.error('Invalid data for MobilityPlot:', { lin_pH, sol1, sol2 });
		return <div>Error loading data. Please check the console for more details.</div>;
	}

	const datasets = sol1.map((sol, index) => {
		const baseHue = (index / sol1.length) * 360;
		return {
			label: labels[index] || `Species ${index + 1} (sol1)`,
			data: sol.map((y, i) => ({ x: lin_pH[i], y: y * 1e9 })),
			borderColor: `hsl(${baseHue}, 100%, 50%)`,
			backgroundColor: `hsla(${baseHue}, 100%, 50%, 0)`,
			fill: false,
			tension: 0,
			borderWidth: 1,
		};
	});

	const datasets2 = sol2.map((sol, index) => {
		const baseHue = (index / sol2.length) * 360;
		return {
			label: labels[index] ? `${labels[index]} (Ionic Effect Considered)` : `Species ${index + 1} (sol2, Ionic Effect Considered)`,
			data: sol.map((y, i) => ({ x: lin_pH[i], y: y * 1e9 })),
			borderColor: `hsl(${baseHue}, 100%, 30%)`,
			backgroundColor: `hsla(${baseHue}, 100%, 80%, 0)`,
			fill: false,
			tension: 0,
			borderWidth: 1,
		};
	});

	// Options for the plot where the ionic effect is not considered
	const optionsWithoutIonicEffect = {
		scales: {
			x: {
				type: 'linear',
				position: 'bottom',
				title: {
					display: true,
					text: 'pH',
					color: 'white',
					font: {
						size: 16,
					},
				},
				ticks: {
					color: 'white',
				}
			},
			y: {
				title: {
					display: true,
					text: 'μX [10^-8 m²/(V⋅s)]',
					color: 'white',
					font: {
						size: 16,
					},
				},
				ticks: {
					callback: function (value) {
						return Number(value.toFixed(1));
					},
					color: 'white',
				}
			}
		},
		plugins: {
			legend: {
				display: true,
				position: 'top',
				labels: {
					color: 'white',
					padding: 20,
					boxWidth: 10,
					font: {
						size: 14,
					},
				},
			},
			title: {
				display: true,
				text: 'Ionic Effect Not Considered',
				color: 'white',
				font: {
					size: 14
				},
			},
		},
		maintainAspectRatio: false,
	};

	// Adjust the options for the plot considering the ionic effect
	const optionsWithIonicEffect = JSON.parse(JSON.stringify(optionsWithoutIonicEffect));
	optionsWithIonicEffect.plugins.title.text = 'Ionic Effect Considered';


	return (
		<div style={{ margin: '14px' }}>
			<div style={{ height:18 }}></div>
			
			<div style={{ width: '800px', height: '300px', color: 'white' }}>
				<Line data={{ datasets: datasets }} options={optionsWithoutIonicEffect} />
			</div>
			<div style={{ width: '800px', height: '300px', color: 'white', marginTop: '40px' }}>
				<Line data={{ datasets: datasets2 }} options={optionsWithIonicEffect} />
			</div>
		</div>
	);
};

export default MobilityPlot;
