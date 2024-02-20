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
	dataType: 'ph_in_sample_region' | 'sample_mobility_ratio' | 'sample_pre_concentration';
	xAxisLabel: 'CI concentration' | 'Analyte Mobility' | 'TE mobility'
	yAxisLabel: 'LE concentration' 
}

const SimpleHeatmap: React.FC<SimpleHeatmapProps> = ({ color, title, loading, dataType, xAxisLabel }) => {
	const { heatmapError, speciesDict, heatmapV2 } = useSpeciesData();
	
	const renderData = heatmapV2[dataType];


	console.log(heatmapV2); 
	const svgRef = useRef<SVGSVGElement>(null);

	//  in javascript
	const mobility_values = [-1.00000000e-08, -1.23529412e-08, -1.47058824e-08, -1.70588235e-08,
		-1.94117647e-08, -2.17647059e-08, -2.41176471e-08, -2.64705882e-08,
		-2.88235294e-08, -3.11764706e-08, -3.35294118e-08, -3.58823529e-08,
		-3.82352941e-08, -4.05882353e-08, -4.29411765e-08, -4.52941176e-08,
		-4.76470588e-08, -5.00000000e-08];
	

	const LE_C_values = [0.001, 0.00150131, 0.00225393, 0.00338386, 0.00508022, 0.00762699, 0.01145048, 0.01719072, 0.02580862, 0.03874675, 0.05817091, 0.08733262, 0.13111339, 0.19684194, 0.29552092, 0.44366873, 0.66608463, 1.0].reverse();

	const point_c_values = [0.001, 0.00150131, 0.00225393, 0.00338386, 0.00508022, 0.00762699, 0.01145048, 0.01719072, 0.02580862, 0.03874675, 0.05817091, 0.08733262, 0.13111339, 0.19684194, 0.29552092, 0.44366873, 0.66608463, 1.0];

	let colorMin = 0;
	let colorMax = 1;

	if (renderData) {
		// Calculate the minimum and maximum values in the data
		const values = renderData
			.flat()
			.map(datapoint => datapoint.computation_value)
			.filter(value => typeof value === 'number');

		const numericValues = values.filter(value => typeof value === 'number') as number[];

		colorMin = Math.min(...numericValues);
		colorMax = Math.max(...numericValues);
	}

	const colorScaleHeatmap = colorScaleGenerator(color).domain([colorMin, colorMax]);
	const gradientId = `gradient-${color}`;

	// Extract given values from grid_results and create a list of lists
	const heatmapData = renderData ? renderData.map(row => row.map(datapoint => datapoint['computation_value'])).reverse() : [];

	const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

	const handleMouseEnter = (rowIndex, colIndex, value, e) => {
		setTooltip({
			show: true,
			content: dataType === 'sample_pre_concentration'
				? `LE Concentration: ${LE_C_values[rowIndex]}, Point C: ${point_c_values[colIndex].toFixed(4)}, Value: ${typeof(value) === 'string' ? value : value.toFixed(1)}`
				: `LE Concentration: ${LE_C_values[rowIndex]}, Mobility: ${mobility_values[colIndex]}, Value: ${typeof(value) === 'string' ? 'ITP failed' : value.toFixed(1)}`,
			x: e.clientX + 10,  // Offset by 10 pixels to the right
			y: e.clientY + 10   // Offset by 10 pixels down
		});

	};


	const handleClick = (rowIndex, colIndex, value, e) => {
		const check = typeof (value) == 'string' ? `LE Concentration: ${LE_C_values[rowIndex]}, Mobility: ${mobility_values[colIndex].toFixed(1)}, Value: ${'ITP failed'}` : `LE Concentration: ${LE_C_values[rowIndex]}, mobility: ${mobility_values[colIndex]}, Value: ${value.toFixed(1)}`;
		if (tooltip.show && tooltip.content === check) {
			// Hide tooltip if the same rectangle is clicked again
			setTooltip({ show: false, content: '', x: 0, y: 0 });
		} else {
			// Show or update tooltip for the new rectangle
			setTooltip({
				show: true,
				content: dataType === 'sample_pre_concentration'
					? `LE Concentration: ${LE_C_values[rowIndex]}, Point C: ${point_c_values[colIndex].toFixed(4)}, Value: ${typeof(value) === 'string' ? value : value.toFixed(1)}`
					: `LE Concentration: ${LE_C_values[rowIndex]}, Mobility: ${mobility_values[colIndex]}, Value: ${typeof(value) === 'string' ? 'ITP failed' : value.toFixed(1)}`,
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
				style={{ fontWeight: '800', marginBottom: '3px', marginLeft:24, fontSize: title.length > 20 ? 12 : 14 }}
			>
				{title}
			</text>

			{renderData && (
				<svg width={200} height={180} ref={svgRef}>
					<g transform="translate(40, 0)">
						{heatmapData.map((row, rowIndex) => {
							return row.map((atepH, colIndex) => {
								// Determine the fill color based on whether atepH is a number or indicates an error
								let fillColor: string;
								if (typeof atepH === 'number') {
									fillColor = colorScaleHeatmap(atepH); // This is safe since atepH is confirmed to be a number
								} else {
									// Use the error color if atepH is not a number
									fillColor = '#FFFFFF';
								}

								return (
									<rect
										key={`${rowIndex}-${colIndex}`}
										x={colIndex * 8}
										y={rowIndex * 8}
										width={8}
										height={8}
										fill={fillColor}
										onMouseLeave={handleMouseLeave}
										onClick={(e) => handleClick(rowIndex, colIndex, atepH, e)}
									/>
								);
							});
						})}

					</g>
        
					{/* X-axis Label (pH) */}
					{/* flip 2 and 3 */}
					<text x={28} y={160} fill="#D3D8DE" fontSize={11}> {dataType == 'ph_in_sample_region' ? '.001 ': '-1e-8'} </text>
					<text x="56%" y="160" fill="#D3D8DE" fontSize={12} fontWeight={600} textAnchor="middle">
						{xAxisLabel}
						<tspan x="56%" dy="12" fontSize="10" fontWeight="normal">{ xAxisLabel == 'CI concentration' ? 'mM' : 'm²/(V.s)'}</tspan>
					</text>
					<text x={166} y={160} fill="#D3D8DE" fontSize={11}>  {dataType == 'ph_in_sample_region' ? '1.000': '-5e-8'} </text>
					
        
					{/* Y-axis Label (LE_C) */}
					<text 
						x={31} // Position the text near the middle of the height
						y={10}  // Position the text slightly off the left edge
						fill="#D3D8DE" 
						fontSize={11} 
						// transform="rotate(-90 -10, 40)"
					>
						{LE_C_values[0]}
					</text>

					<text 
						x={-95} // Initial X position for "LE Concentration"
						y={72}  // Initial Y position for "LE Concentration"
						fill="#D3D8DE" 
						fontSize={13} 
						fontWeight={600}
						transform="rotate(-90 -10, 40)"
					>
						LE Concentration
						<tspan dy="14" dx='-70' fontSize="11" fontWeight="normal">mM</tspan>
					</text>
					
					<text 
						x={16} // Position the text near the middle of the height
						y={144}  // Position the text slightly off the left edge
						fill="#D3D8DE" 
						fontSize={11} 
						// transform="rotate(-90 -10, 40)"
					>
						{'.001'}
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
						x={62}
						y={6}
						width={90}
						height={10}
						fill={`url(#${gradientId})`}  // Use the unique gradient ID here
					/>
					{/* Adding min and max labels to the gradient bar */}
					<text x={60} y={15} fontSize={11} textAnchor="end" fill="#D3D8DE">{colorMin.toFixed(1)}</text>
					<text x={155} y={15} fontSize={11} textAnchor="start" fill="#D3D8DE">{colorMax.toFixed(1)}</text>
					{/* <text x={98} y={22} fontSize={11} textAnchor="start" fill="#D3D8DE">
						{'units'}
					</text> */}
				</svg>
			</div>
		</div>
	);
};

export default SimpleHeatmap; 


