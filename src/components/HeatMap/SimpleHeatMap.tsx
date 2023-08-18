
import React from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateGreys, interpolatePlasma, interpolateViridis} from 'd3-scale-chromatic';

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
	default:
		return scaleSequential(interpolateViridis).domain([0, colorMax]);
	}
};

interface SimpleHeatmapProps {
    color: 'viridis' | 'gray' | 'plasma';
	title: string;
}

const SimpleHeatmap: React.FC<SimpleHeatmapProps> = ({ color, title }) => {
	const colorScale = colorScaleGenerator(color).domain([0, 1]);

	return (
		<div style = {{display:'flex', flexDirection: 'column' }} >
		
			<text
				textAnchor="middle"
				fill="#D3D8DE"
				style={{fontWeight:'700', alignSelf:'center'}}
			>
				{title}
			</text>
			<svg width={180} height={220}>  {/* Adjusted height */}
				<defs>
					<linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor={colorScale(1)} /> {/* Swapped positions */}
						<stop offset="100%" stopColor={colorScale(0)} /> {/* Swapped positions */}
					</linearGradient>
				</defs>
				{data.map((row, rowIndex) => {
					return row.map((value, colIndex) => {
						return (
							<rect
								key={`${rowIndex}-${colIndex}`}
								x={colIndex * 8}  
								y={rowIndex * 8}  
								width={8}
								height={8}
								fill={colorScale(value)}
							/>
						);
					});
				})}
				<rect
					x={30} 
					y={200} 
					width={120} 
					height={10}
					fill="url(#gradient)"
				/>
			</svg>
			<text
				textAnchor="middle"
				fill="#D3D8DE"
				style={{alignSelf:'center'}}
			>
				No point distinction
			</text>
		</div>
	);
};


export default SimpleHeatmap;
