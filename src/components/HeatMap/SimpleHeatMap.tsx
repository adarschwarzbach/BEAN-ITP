
import React from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateGreys, interpolatePlasma, interpolateViridis, interpolateInferno } from 'd3-scale-chromatic';
import { useSpeciesData } from '../../Contexts/SpeciesData';

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
}

const SimpleHeatmap: React.FC<SimpleHeatmapProps> = ({ color, title }) => {
	const colorScaleHeatmap = colorScaleGenerator(color).domain([0, colorMax]);
	const colorScaleBar = colorScaleGenerator(color).domain([0, 1]);
	const gradientId = `gradient-${color}`;  // Unique gradient ID based on the color prop


	const { ateHeatmapResults, setAteHeatmapResults, loading, setLoading } = useSpeciesData();
	
	console.log('from heatmap', ateHeatmapResults);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<text
				textAnchor="middle"
				fill="#D3D8DE"
				style={{ fontWeight: '700', marginBottom: '4px' }}
			>
				{title}
			</text>

			<svg width={180} height={180}>
				{data.map((row, rowIndex) => {
					return row.map((value, colIndex) => {
						return (
							<rect
								key={`${rowIndex}-${colIndex}`}
								x={colIndex * 8}
								y={rowIndex * 8}
								width={8}
								height={8}
								fill={colorScaleHeatmap(value)}
							/>
						);
					});
				})}
			</svg>

			<div style={{marginTop: '0px'}}>
				<svg width={180} height={20}> {/* Separate SVG for the gradient bar */}
					<defs>
						<linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="100%">
							<stop offset="0%" stopColor={colorScaleBar(0)} />
							<stop offset="5%" stopColor={colorScaleBar(0.05)} />
							<stop offset="10%" stopColor={colorScaleBar(0.1)} />
							<stop offset="15%" stopColor={colorScaleBar(0.15)} />
							<stop offset="20%" stopColor={colorScaleBar(0.2)} />
							<stop offset="25%" stopColor={colorScaleBar(0.25)} />
							<stop offset="30%" stopColor={colorScaleBar(0.3)} />
							<stop offset="35%" stopColor={colorScaleBar(0.35)} />
							<stop offset="40%" stopColor={colorScaleBar(0.4)} />
							<stop offset="45%" stopColor={colorScaleBar(0.45)} />
							<stop offset="50%" stopColor={colorScaleBar(0.5)} />
							<stop offset="55%" stopColor={colorScaleBar(0.55)} />
							<stop offset="60%" stopColor={colorScaleBar(0.6)} />
							<stop offset="65%" stopColor={colorScaleBar(0.65)} />
							<stop offset="70%" stopColor={colorScaleBar(0.7)} />
							<stop offset="75%" stopColor={colorScaleBar(0.75)} />
							<stop offset="80%" stopColor={colorScaleBar(0.8)} />
							<stop offset="85%" stopColor={colorScaleBar(0.85)} />
							<stop offset="90%" stopColor={colorScaleBar(0.9)} />
							<stop offset="95%" stopColor={colorScaleBar(0.95)} />
							<stop offset="100%" stopColor={colorScaleBar(1)} />	
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
					<text x={20} y={17} fontSize={10} textAnchor="end" fill="#D3D8DE">0</text>
					<text x={155} y={17} fontSize={10} textAnchor="start" fill="#D3D8DE">{colorMax.toFixed(2)}</text>
				</svg>
			</div>

		</div>
	);
};





export default SimpleHeatmap;
