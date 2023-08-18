
import React from 'react';
import { scaleSequential, scaleLinear } from 'd3-scale';
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

const LinedHeatMap: React.FC<SimpleHeatmapProps> = ({ color, title }) => {
	const colorScale = colorScaleGenerator(color);

	const xScale = scaleLinear().domain([0, 25]).range([0, 250]);
	const yScale = scaleLinear().domain([0, 25]).range([0, 250]);

	return (
		<div style = {{display:'flex', flexDirection: 'column' }} >
			<text
				textAnchor="middle"
				fill="#D3D8DE"
				style={{fontWeight:'700', alignSelf:'center'}}
			>
				{title}
			</text>
			<svg width={184} height={180}>
				<text x="50%" y="15" textAnchor="middle" fontSize="16">{title}</text>
			
				{data.map((row, rowIndex) => {
					return row.map((value, colIndex) => {
						return (
							<rect
								key={`${rowIndex}-${colIndex}`}
								x={xScale(colIndex)}  
								y={yScale(rowIndex)}  
								width={8}
								height={8}
								fill={colorScale(value)}
							/>
						);
					});
				})}

				{/* Drawing the x and y axes */}
				{Array.from({ length: 25 }).map((_, i) => (
					<line 
						key={`x-${i}`} 
						x1={xScale(i) + 5} 
						y1={0} 
						x2={xScale(i) + 5} 
						y2={250} 
						stroke="#aaa" 
						strokeWidth="0.5"
					/>
				))}
				{Array.from({ length: 25 }).map((_, i) => (
					<line 
						key={`y-${i}`} 
						x1={0} 
						y1={yScale(i) + 5} 
						x2={250} 
						y2={yScale(i) + 5} 
						stroke="#aaa" 
						strokeWidth="0.5"
					/>
				))}
			</svg>
			<text
				textAnchor="middle"
				fill="#D3D8DE"
				style={{alignSelf:'center'}}
			>
				Grid through points
			</text>
		</div>
	);
};

export default LinedHeatMap;
