
import React from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateGreys, interpolatePlasma, interpolateViridis, interpolateInferno } from 'd3-scale-chromatic';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { Card } from '@blueprintjs/core';
import { SKELETON } from '@blueprintjs/core/lib/esm/common/classes';


const generateLargeData = (rows: number, columns: number): number[][] => {
	const data: number[][] = [];
	const centerX = columns / 2;
	const centerY = rows / 2;
	const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

	for (let i = 0; i < rows; i++) {
		const rowData: number[] = [];

		for (let j = 0; j < columns; j++) {
			const distanceFromCenter = Math.sqrt((centerX - j) ** 2 + (centerY - i) ** 2);
			const normalizedDistance = distanceFromCenter / maxDistance; 

			// This will be a random value that decreases as we get closer to the center
			const randomAdjustment = Math.random() * normalizedDistance;

			rowData.push(randomAdjustment);
		}

		data.push(rowData);
	}

	return data;
};

const data = generateLargeData(25, 25);
const colorMax = Math.max(...data.map(row => Math.max(...row)));

const colorScaleGenerator = (color: string) => {
	switch (color) {
	case 'viridis':
		return scaleSequential(interpolateViridis).domain([0, colorMax]);
	case 'gray':
		return scaleSequential(interpolateGreys).domain([0, colorMax]);
	case 'plasma':
		return scaleSequential(interpolatePlasma).domain([0, colorMax]);
	case 'inferno':
		return scaleSequential(interpolateInferno).domain([0, colorMax]);
	default:
		return scaleSequential(interpolateViridis).domain([0, colorMax]);
	}

};

interface SimpleHeatmapProps {
    color: 'viridis' | 'gray' | 'plasma' | 'inferno';
	title: string;
	loading: boolean;
	dataType: 'ATE_pH' | 'sample_pH' | 'sample_c_sample';
}

const SimpleHeatmap: React.FC<SimpleHeatmapProps> = ({ color, title, loading, dataType }) => {
	const { ateHeatmapResults, heatmapError } = useSpeciesData();

	console.log(JSON.stringify(ateHeatmapResults, null, 4));

	let colorMin = 0;
	let colorMax = 1;

	if (ateHeatmapResults) {
		// Calculate the minimum and maximum values in the data
		const values = ateHeatmapResults.grid_results.flat().map(datapoint => datapoint.body.computation_value[dataType]);
		colorMin = Math.min(...values);
		colorMax = Math.max(...values);
	}

	const colorScaleHeatmap = colorScaleGenerator(color).domain([colorMin, colorMax]);
	const gradientId = `gradient-${color}`;

	// Extract given values from grid_results and create a list of lists
	const heatmapData = ateHeatmapResults ? ateHeatmapResults.grid_results.map(row => row.map(datapoint => datapoint.body['computation_value'][dataType])) : [];


	if (loading) {
		return (
			<Card className={loading ? SKELETON : ''}  >
				<div style={{height:190, width: 140}} />
			</Card>
		);
	}

	if (heatmapError) {
		return (
			<Card className={''} >
				
				<div style = {{display:'flex', flexDirection:'column', alignItems:'center'}}>
					<text
						fill="white"
						style={{ fontWeight: '500', marginBottom: '4px', textAlign:'center', paddingBottom: '12px' }}
					>
						{'Error Computing heatmap'}
					</text>
					<text
						fill="#D3D8DE"
						style={{ fontWeight: '300', marginBottom: '4px', textAlign:'center' }}
					>
						{'Please try new inputs'}
					</text>
				</div>
				<div style={{height:120, width: 150}} />
			</Card>
		);
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<text
				textAnchor="middle"
				fill="#D3D8DE"
				style={{ fontWeight: '700', marginBottom: '4px' }}
			>
				{title}
			</text>

			{ateHeatmapResults && (
				<svg width={180} height={180}>
					{heatmapData.map((row, rowIndex) => {
						return row.map((atepH, colIndex) => {
							return (
								<rect
									key={`${rowIndex}-${colIndex}`}
									x={colIndex * 8}
									y={rowIndex * 8}
									width={8}
									height={8}
									fill={colorScaleHeatmap(atepH)}
								/>
							);
						});
					})}
				</svg>
			)}

			<div style={{ marginTop: '0px' }}>
				<svg width={190} height={20}> {/* Separate SVG for the gradient bar */}
					<defs>
						<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor={colorScaleHeatmap(colorMin)} />
							<stop offset="5%" stopColor={colorScaleHeatmap(colorMin + (0.05 * (colorMax - colorMin)))} />
							<stop offset="10%" stopColor={colorScaleHeatmap(colorMin + (0.1 * (colorMax - colorMin)))} />
							<stop offset="15%" stopColor={colorScaleHeatmap(colorMin + (0.15 * (colorMax - colorMin)))} />
							<stop offset="20%" stopColor={colorScaleHeatmap(colorMin + (0.2 * (colorMax - colorMin)))} />
							<stop offset="25%" stopColor={colorScaleHeatmap(colorMin + (0.25 * (colorMax - colorMin)))} />
							<stop offset="30%" stopColor={colorScaleHeatmap(colorMin + (0.3 * (colorMax - colorMin)))} />
							<stop offset="35%" stopColor={colorScaleHeatmap(colorMin + (0.35 * (colorMax - colorMin)))} />
							<stop offset="40%" stopColor={colorScaleHeatmap(colorMin + (0.4 * (colorMax - colorMin)))} />
							<stop offset="45%" stopColor={colorScaleHeatmap(colorMin + (0.45 * (colorMax - colorMin)))} />
							<stop offset="50%" stopColor={colorScaleHeatmap(colorMin + (0.5 * (colorMax - colorMin)))} />
							<stop offset="55%" stopColor={colorScaleHeatmap(colorMin + (0.55 * (colorMax - colorMin)))} />
							<stop offset="60%" stopColor={colorScaleHeatmap(colorMin + (0.6 * (colorMax - colorMin)))} />
							<stop offset="65%" stopColor={colorScaleHeatmap(colorMin + (0.65 * (colorMax - colorMin)))} />
							<stop offset="70%" stopColor={colorScaleHeatmap(colorMin + (0.7 * (colorMax - colorMin)))} />
							<stop offset="75%" stopColor={colorScaleHeatmap(colorMin + (0.75 * (colorMax - colorMin)))} />
							<stop offset="80%" stopColor={colorScaleHeatmap(colorMin + (0.8 * (colorMax - colorMin)))} />
							<stop offset="85%" stopColor={colorScaleHeatmap(colorMin + (0.85 * (colorMax - colorMin)))} />
							<stop offset="90%" stopColor={colorScaleHeatmap(colorMin + (0.9 * (colorMax - colorMin)))} />
							<stop offset="95%" stopColor={colorScaleHeatmap(colorMin + (0.95 * (colorMax - colorMin)))} />
							<stop offset="100%" stopColor={colorScaleHeatmap(colorMax)} />
						</linearGradient>
					</defs>
					<rect
						x={30}
						y={10}
						width={120}
						height={10}
						fill={`url(#${gradientId})`}  // Use the unique gradient ID here
					/>
					{/* Adding min and max labels to the gradient bar */}
					<text x={20} y={17} fontSize={10} textAnchor="end" fill="#D3D8DE">{colorMin.toFixed(2)}</text>
					<text x={155} y={17} fontSize={10} textAnchor="start" fill="#D3D8DE">{colorMax.toFixed(2)}</text>
				</svg>
			</div>
		</div>
	);
};

export default SimpleHeatmap; 


