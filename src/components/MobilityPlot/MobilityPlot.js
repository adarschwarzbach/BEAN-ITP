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
const CustomLegend = () => {
	return (
		<div style={{ fontSize: '16px', color: 'white', width: 135 }}>
			<i>μ</i><span style={{ verticalAlign: 'sub', fontSize: 'smaller' }}><i>X</i></span> [10
			<span style={{ verticalAlign: 'super', fontSize: 'smaller' }}>-8</span> m²/(V⋅s)]
		</div>
	);
};



const DashDistinction = () => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '16px', color: 'white' }}>
			<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
				<div style={{ width: '30px', height: '2px', backgroundColor: 'white', marginRight: '10px' }}></div>
				Without Ionic Strength Effect
			</div>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<div style={{ width: '30px', height: '2px', border: '2px dashed white', marginRight: '10px' }}></div>
				With Ionic Strength Effect
			</div>
		</div>
	);
};
  
  
const MobilityPlot = () => {
	const { mobilityData, speciesDict, error } = useSpeciesData();

	const { lin_pH = [], sol1 = [], sol2 = [] } = mobilityData || {};
	const labels = Object.values(speciesDict || {}).map(species => species.Name);

	if (!Array.isArray(lin_pH) || !Array.isArray(sol1) || !Array.isArray(sol2) || !lin_pH.length || !sol1.length || !sol2.length) { // remove error check
		console.error('Invalid data for MobilityPlot:', { lin_pH, sol1, sol2 });
		return <div style = {{fontSize:32, margin:40, color:'white'}} > Error building mobility plot</div>;
	}

	const datasets = [...sol1.map((sol, index) => {
		const hueRange = 400; // Max hue, avoiding purple range
		const hueStep = hueRange / sol1.length;
		const baseHue = (index * hueStep) % hueRange; // Adjust so it never reaches purple
		return {
			label: labels[index] || `Species ${index + 1} (sol1)`,
			data: sol.map((y, i) => ({ x: lin_pH[i], y: y  })),
			borderColor: `hsl(${baseHue}, 100%, 50%)`,
			backgroundColor: `hsla(${baseHue}, 100%, 50%, 0)`,
			fill: false,
			tension: 0,
			borderWidth: 1,
			pointRadius: 0, // Ensure points are not visible
		};
	}), ...sol2.map((sol, index) => {
		const hueRange = 400; // Max hue, avoiding purple range
		const hueStep = hueRange / sol1.length;
		const baseHue = (index * hueStep) % hueRange; // Adjust so it never reaches purple
		return {
			label: `${labels[index]}`,
			data: sol.map((y, i) => ({ x: lin_pH[i], y: y  })),
			borderColor: `hsl(${baseHue}, 100%, 30%)`,
			backgroundColor: `hsla(${baseHue}, 100%, 80%, 0)`,
			borderDash: [5, 5], // Distinguish by dash style
			fill: false,
			tension: 0,
			borderWidth: 2,
			pointRadius: 0, // Ensure points are not visible
		};
	})];

	const options = {
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
					// text: 'μX [10⁻⁸ m²/(V⋅s)]',
					color: 'white',
					font: {
						size: 16,
					},
				},
				ticks: {
					callback: function (value) {
						if (String(value).length > 2) {
							return Number((value * 1e8).toFixed(2)); // not normalized
						}
						else {
							return Number(value.toFixed(2)); // already normalized
						}
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
			// title: {
			// 	display: true,
			// 	text: 'Mobility vs pH - Including and Excluding Ionic Strength Effect',
			// 	color: 'white',
			// 	font: {
			// 		size: 14
			// 	},
			// },
		},
		maintainAspectRatio: false,
	};

	return (

		<div style={{padding:'30px', display:'flex', flexDirection:'column', alignItems:'center'}}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '14px', height: '300px' }}>
				<div style={{ position: 'absolute', marginLeft: '-900px', color: 'white',}}>
					<CustomLegend />
				</div>
				<div style={{ width: '800px', height: '300px', display: 'flex', justifyContent: 'center' }}>
					<Line data={{ datasets }} options={options} />
				</div>
			</div>
			<div style={{height:0, display:'flex', alignItems:'center', justifyItems:'center'}}  />
			<DashDistinction />
		</div>
	);
};

export default MobilityPlot;
