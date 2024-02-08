
import React, {useState, useRef} from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateGreys, interpolatePlasma, interpolateViridis, interpolateInferno } from 'd3-scale-chromatic';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { Tooltip, Card } from '@blueprintjs/core';
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
	const { ateHeatmapResults, heatmapError, speciesDict } = useSpeciesData();

	const svgRef = useRef<SVGSVGElement>(null);

	//  in javascript
	const ph_data: number[] = [];  // Initialize as an empty array
	const pH = speciesDict['1']['pKa'][0];  // Assuming this fetches a number
	
	for (let i = 0; i < 21; i++) {
		ph_data.push(parseFloat((pH - 1 + i * 0.1).toFixed(1)));
	}

	const LE_C_values = [1.0, 1.4, 2.1, 3.0, 4.3, 6.2,
		8.9, 12.7, 18.3, 26.4, 38.0,
		54.6, 78.5, 112.9, 162.4, 233.6,
		336.0, 483.3, 695.2, 1000.0
	].reverse();



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
	const heatmapData = ateHeatmapResults ? ateHeatmapResults.grid_results.map(row => row.map(datapoint => datapoint.body['computation_value'][dataType])).reverse() : [];

	const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

	const handleMouseEnter = (rowIndex, colIndex, value, e) => {
		setTooltip({
			show: true,
			content: `LE Concentration: ${LE_C_values[rowIndex]}, pH: ${ph_data[colIndex].toFixed(1)}, Value: ${value.toFixed(2)}`, // Include the data point value
			x: e.clientX + 10,  // Offset by 10 pixels to the right
			y: e.clientY + 10   // Offset by 10 pixels down
		});

	};


	const handleClick = (rowIndex, colIndex, value, e) => {
		if (tooltip.show && tooltip.content === `LE_C: ${LE_C_values[rowIndex]}, pH: ${ph_data[colIndex]}, Value: ${value.toFixed(2)}`) {
			// Hide tooltip if the same rectangle is clicked again
			setTooltip({ show: false, content: '', x: 0, y: 0 });
		} else {
			// Show or update tooltip for the new rectangle
			setTooltip({
				show: true,
				content: `LE Concentration: ${LE_C_values[rowIndex].toFixed(0)}, pH: ${ph_data[colIndex].toFixed(1)}, ${title}: ${value.toFixed(1)}`,
				x: e.clientX + 10, 
				y: e.clientY + 10
			});
		}
	};
	


	const handleMouseLeave = () => {
		setTimeout(() => {
			if (tooltip.show) {
				setTooltip(prevTooltip => ({ ...prevTooltip, show: false }));
			}
		});
	};


	if (loading) {
		return (
			<Card className={loading ? SKELETON : ''}  >
				<div style={{height:190, width: 140, marginLeft:16}} />
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
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',  }}>
			<text
				textAnchor="middle"
				fill="#D3D8DE"
				style={{ fontWeight: '700', marginBottom: '4px', marginLeft:38, fontSize: title.length > 20 ? 9 : 12 }}
			>
				{title}
			</text>

			{ateHeatmapResults && (
				<svg width={200} height={180} ref={svgRef}>
					<g transform="translate(40, 0)">
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
										// onMouseEnter={(e) => handleMouseEnter(rowIndex, colIndex, atepH, e)}
										onMouseLeave={handleMouseLeave}
										onClick={(e) => handleClick(rowIndex, colIndex, atepH, e)}
									/>
								);
							});
						})}
					</g>
        
					{/* X-axis Label (pH) */}
					<text x={45} y={174} fill="#D3D8DE" fontSize={10}> {ph_data[0].toFixed(1)} </text>
					<text x={115} y={174} fill="#D3D8DE" fontSize={12}>pH</text>
					<text x={185} y={174} fill="#D3D8DE" fontSize={10}> {ph_data[ph_data.length - 1].toFixed(1)} </text>
        
					{/* Y-axis Label (LE_C) */}
					<text 
						x={12} // Position the text near the middle of the height
						y={12}  // Position the text slightly off the left edge
						fill="#D3D8DE" 
						fontSize={10} 
						// transform="rotate(-90 -10, 40)"
					>
						{LE_C_values[0]}
					</text>

					<text 
						x={-100} // Position the text near the middle of the height
						y={84}  // Position the text slightly off the left edge
						fill="#D3D8DE" 
						fontSize={12} 
						transform="rotate(-90 -10, 40)"
					>
						{'LE \n Concentration'}
					</text>
					
					<text 
						x={30} // Position the text near the middle of the height
						y={155}  // Position the text slightly off the left edge
						fill="#D3D8DE" 
						fontSize={10} 
						// transform="rotate(-90 -10, 40)"
					>
						{LE_C_values[ LE_C_values.length - 1]}
					</text>
				</svg>
			)}

			{tooltip.show && (
				<div 
					style={{ 
						position: 'absolute', 
						left: tooltip.x, 
						top: tooltip.y,
						backgroundColor: '#394B59',  // Blueprint's tooltip background color
						color: 'white',  // Text color
						padding: '10px',  // Padding inside the tooltip
						borderRadius: '3px',  // Rounded corners
						boxShadow: '0 0 5px rgba(0,0,0,0.2)',  // Shadow for a "lifted" effect
						fontSize: '13px',  // Font size similar to Blueprint
						zIndex: 9999,  // Ensure it's above other elements
						transition: 'left 0.1s ease, top 0.1s ease',  // Transition for smooth animation
					}}
				>
					{tooltip.content}
				</div>
			)}

			<div style={{ marginTop: '0px'}}>
				<svg width={190} height={40}> {/* Separate SVG for the gradient bar */}
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
						x={65}
						y={10}
						width={100}
						height={10}
						fill={`url(#${gradientId})`}  // Use the unique gradient ID here
					/>
					{/* Adding min and max labels to the gradient bar */}
					<text x={60} y={17} fontSize={10} textAnchor="end" fill="#D3D8DE">{colorMin.toFixed(2)}</text>
					<text x={170} y={17} fontSize={10} textAnchor="start" fill="#D3D8DE">{colorMax.toFixed(2)}</text>
					<text x={110} y={32} fontSize={10} textAnchor="start" fill="#D3D8DE">
						{title == 'Sample concentration in Sample' ? 'mM' : ''}
					</text>
				</svg>
			</div>
		</div>
	);
};

export default SimpleHeatmap; 


