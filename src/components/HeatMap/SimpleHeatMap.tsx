/* eslint-disable */

import React, { useState, useRef, useEffect } from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateGreys, interpolatePlasma, interpolateViridis, interpolateInferno } from 'd3-scale-chromatic';
import { useSpeciesData } from '../../Contexts/SpeciesData';
import { Tooltip, Card } from '@blueprintjs/core';
import { SKELETON } from '@blueprintjs/core/lib/esm/common/classes';
import CustomAxisLabel from './CustomAxisLabel';



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
	xAxisLabel: 'CI concentration' | 'Analyte Mobility' | 'TE Mobility'
	yAxisLabel: 'LE concentration' 
}

const SimpleHeatmap: React.FC<SimpleHeatmapProps> = ({ color, title, loading, dataType, xAxisLabel }) => {
	const { heatmapError, speciesDict, heatmapV2 } = useSpeciesData();
	const [negOrPos, setNegOrPos] = useState('+');

	useEffect(() => {
		setNegOrPos(speciesDict['0'].valence[0] < 0 ? '-' : '+');
	}, [heatmapV2]);
	
	const renderData = heatmapV2[dataType];


	const svgRef = useRef<SVGSVGElement>(null);
	
	

	//  in javascript
	let mobility_values = [-1.00000000e-08, -1.23529412e-08, -1.47058824e-08, -1.70588235e-08,
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

	function toScientificNotation(num) {
		// Ensure the input is a number
		if (typeof num !== 'number') {
			throw new TypeError('Input must be a number');
		}
		
		// Convert the number to scientific notation with 3 significant figures
		return num.toExponential(2);
	}

	const colorScaleHeatmap = colorScaleGenerator(color).domain([colorMin, colorMax]);
	const gradientId = `gradient-${color}`;

	// Extract given values from grid_results and create a list of lists
	const heatmapData = renderData ? renderData.map(row => row.map(datapoint => datapoint['computation_value'])).reverse() : [];

	const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

	const handleMouseEnter = (rowIndex, colIndex, value, e) => {
		let message;
		let mobility_val_normalized = mobility_values[colIndex];
		if (typeof(value) === 'string') {
			switch (value) {
			case 'itpCheck failed':
				message = 'ITP failed';
				break;
			case 'error due to timeout or other server-side issue':
				message = 'Timed out';
				break;
			case 'error - Server timed out or invalid JSON format':
				message = 'ITP did not converge';
				break;
			default:
				message = value; // Fallback to the actual message if none of the cases match
			}
		} else {
			// For numerical values, format the message with the value to one decimal place
			message = value.toFixed(2);
			if (value > 0 && mobility_val_normalized < 0) {
				mobility_val_normalized = -1 * mobility_val_normalized
			}
		}
	
		setTooltip({
			show: true,
			content: `LI concentration: ${toScientificNotation(LE_C_values[rowIndex])}, ${
				dataType === 'ph_in_sample_region'
				? `CI concentration: ${toScientificNotation(point_c_values[colIndex])}, `
				: dataType === 'sample_pre_concentration'
				? `TI mobility: ${toScientificNotation(mobility_val_normalized)}, `
				: `A mobility: ${toScientificNotation(mobility_val_normalized)}, `
			}${
				dataType === 'ph_in_sample_region' ? 'pH: ' : 'mobility ratio: '
			} ${message}`,			
			x: e.clientX + 10, // Offset by 10 pixels to the right
			y: e.clientY + 10  // Offset by 10 pixels down
		});
	};
	
	const handleClick = (rowIndex, colIndex, value, e) => {
		let message;
		if (typeof(value) === 'string') {
			switch (value) {
			case 'itpCheck failed':
				message = 'ITP failed';
				break;
			case 'error due to timeout or other server-side issue':
				message = 'Timed out';
				break;
			case 'error - Server timed out or invalid JSON format':
				message = 'ITP did not converge';
				break;
			default:
				message = value; // Fallback to the actual message if none of the cases match
			}
		} else {
			// For numerical values, format the message with the value to one decimal place
			message = value.toFixed(1);
		}
	
		const checkContent = `LE Concentration: ${LE_C_values[rowIndex].toFixed(3)}, ${
			dataType === 'sample_pre_concentration'
				? `Point: ${point_c_values[colIndex].toFixed(3)}, `
				: `Mobility: ${mobility_values[colIndex].toFixed(3)}, `
		}Value: ${message}`;
	
		if (tooltip.show && tooltip.content === checkContent) {
			// Hide tooltip if the same rectangle is clicked again
			setTooltip({ show: false, content: '', x: 0, y: 0 });
		} else {
			// Show or update tooltip for the new rectangle
			setTooltip({
				show: true,
				content: checkContent,
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
				<div style={{height:190, width: 140, marginLeft:16, marginBottom:20}} />
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
						style={{ fontWeight: '500', marginBottom: '4px', textAlign:'center' }}
					>
						{'Please try new inputs'}
					</text>
				</div>
				<div style={{height:120, width: 150}} />
			</Card>
		);
	}
	

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
			<text style = {{paddingLeft:25, marginBottom: title === 'pH in Sample Region' ?  -0 : 4}}>
				Heatmap of
			</text>
			<text
				textAnchor="middle"
				fill="#D3D8DE"
				style={{ fontWeight: '500', marginBottom: '3px', marginLeft:24, fontSize: title.length > 20 ? 12 : 14 }}
			>
				{<svg width="200" height={title === 'Sample Mobility Ratio' || title === 'Sample Pre Concentration' ? '50' : '30'}>
					{title === 'Sample Mobility Ratio' && (
						<>
							<text textAnchor="middle" fill="#D3D8DE" x="100" y="15" fontSize="14" style={{ fontStyle: 'italic' }}>
            μ<tspan baselineShift="sub" fontSize="10">A</tspan>
								<tspan baselineShift="super" fontSize="10" dx = '-6'>ATE</tspan>
							</text>
							<line x1="75" y1="25" x2="125" y2="25" stroke="#D3D8DE" strokeWidth="1"/>
							<text textAnchor="middle" fill="#D3D8DE" x="100" y="40" fontSize="14" style={{ fontStyle: 'italic' }}>
            μ<tspan baselineShift="sub" fontSize="10">TI</tspan>
								<tspan baselineShift="super" fontSize="10" dx = '-8'>ATE</tspan>
							</text>
						</>
					)}

					{title === 'Sample Pre Concentration' && (
						<>
							<text textAnchor="middle" fill="#D3D8DE" x="100" y="15" fontSize="14" style={{ fontStyle: 'italic' }}>
		μ<tspan baselineShift="sub" fontSize="10">A</tspan>
								<tspan baselineShift="super" fontSize="10" dx = '-6'>ATE</tspan>
							</text>
							<line x1="75" y1="25" x2="125" y2="25" stroke="#D3D8DE" strokeWidth="1"/>
							<text textAnchor="middle" fill="#D3D8DE" x="100" y="40" fontSize="14" style={{ fontStyle: 'italic' }}>
		μ<tspan baselineShift="sub" fontSize="10">TI</tspan>
								<tspan baselineShift="super" fontSize="10" dx = '-8'>ATE</tspan>
							</text>
						</>
					)}

					{title === 'pH in Sample Region' && (
						<text textAnchor="middle" fill="#D3D8DE" x="100" y="24" fontSize="14">
          pH<tspan fontSize="12"  dy = '-7' style={{ fontStyle: 'italic' }}>s</tspan>
						</text>
					)}
				</svg>}

			</text>

			{renderData && (
				<svg width={200} height={190} ref={svgRef}>
					{/* SVG elements remain unchanged */}
					<g transform="translate(40, 0)">
						{heatmapData.map((row, rowIndex) => {
							return row.map((value, colIndex) => {
								let fillColor: string;
								let textStrikethrough = false;
								let textColor = '#D3D8DE'; // Default text color
                                
								if (typeof value === 'string') {
									// Apply different styles based on the error message
									if (value === 'itpCheck failed') {
										fillColor = '#FFFFFF'; // white
									} else if (value === 'error - Server timed out or invalid JSON format') {
										fillColor = '#A9A9A9'; // gray
										textColor = '#FFFFFF';
										textStrikethrough = true;
									} else if (value.includes('error due to timeout or other server-side issue')) {
										fillColor = '#A9A9A9'; // Dark Gray
										textColor = '#FFFFFF';
									} else {
										fillColor = '#FFFFFF'; // Default error color
									}
								} else if (typeof value === 'number') {
									fillColor = colorScaleHeatmap(value);
								} else {
									fillColor = '#FFFFFF'; // Fallback color
								}

								return (
									<g key={`${rowIndex}-${colIndex}`}>
										<rect
											x={colIndex * 8}
											y={rowIndex * 8}
											width={8}
											height={8}
											fill={fillColor}
											onMouseEnter={(e) => handleMouseEnter(rowIndex, colIndex, value, e)}
											onMouseLeave={handleMouseLeave}
											// onClick={(e) => handleClick(rowIndex, colIndex, value, e)} // gotta replace on click if you want these sticky
										/>
										{typeof value === 'string' && (
											<text
												x={(colIndex * 8) + 4}
												y={(rowIndex * 8) + 4}
												fontSize="6"
												fill={textColor}
												style={{ textDecoration: textStrikethrough ? 'line-through' : 'none' }}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												{textStrikethrough ? '-' : ' ' } 
											</text>
										)}
									</g>
								);
							});
						})}
					</g>
					{/* X-axis Label (pH) */}
					{/* flip 2 and 3 */}
					<text x={22} y={160} fill="#D3D8DE" fontSize={14}> {dataType == 'ph_in_sample_region' ? '.001 ': negOrPos == '-' ? -1e-8 : 1e-8} </text>
					<text x="56%" y="164" fill="#D3D8DE" fontSize={12} fontWeight={500} textAnchor="middle">
						{xAxisLabel === 'CI concentration' && (
							<>
								<tspan style={{ fontStyle: 'italic' }}  fontSize={16} x='56%'>c</tspan>
								<tspan fontSize="14" dy="9" dx = '-1'style={{ fontStyle: 'italic' }}>CI</tspan>
								
								<tspan fontSize="14" dy="-14" dx = '-11' style={{ fontStyle: 'italic' }}>LE</tspan>
							</>
						)}
						{xAxisLabel === 'Analyte Mobility' && (
							<>
								<tspan style={{ fontStyle: 'italic' }} fontSize={14}>μ</tspan>
								<tspan dy="-6" dx= '1' fontSize="14">o</tspan>
								<tspan dy="12" dx = '-10' fontSize="14" style={{ fontStyle: 'italic' }}>A</tspan>
							</>
						)}
						{xAxisLabel === 'TE Mobility' && (
							<>
								<tspan fontSize={16} style={{ fontStyle: 'italic' }}>μ</tspan>
								<tspan dy="-8" dx = '1' fontSize="14">o</tspan>
								<tspan dy="13" dx = '-10' fontSize="14" style={{ fontStyle: 'italic' }}>TI</tspan>
							</>
						)}
						{/* This tspan is for unit display, adjust x and dy to align it correctly */}
						<tspan x="56%" dy={xAxisLabel === 'CI concentration' ? 29 : 18} fontSize={xAxisLabel === 'CI concentration' ? "13" : "14" } fontWeight="normal">
							{xAxisLabel === 'CI concentration' ? '[M]' : '[m²/(V.s)]'}
						</tspan>
					</text>

					<text x={158} y={160} fill="#D3D8DE" fontSize={14}>  {dataType == 'ph_in_sample_region' ? '1.000': negOrPos == '-' ? -5e-8 : 5e-8} </text>
					
        
					{/* Y-axis Label (LE_C) */}
					<text 
						x={31} // Position the text near the middle of the height
						y={10}  // Position the text slightly off the left edge
						fill="#D3D8DE" 
						fontSize={14} 
						// transform="rotate(-90 -10, 40)"
					>
						{LE_C_values[0]}
					</text>

					<text 
						x={12} // Adjusted for better centering due to the upright orientation
						y={80} // Adjusted for vertical positioning
						fill="#D3D8DE" 
						fontSize={12} 
						fontWeight={500}
						style={{ fontStyle: 'italic' }}
					>
						C
						<tspan baselineShift="super" fontSize="12" x={22} style={{ fontStyle: 'italic' }}>LE</tspan>
						<tspan x="21" dy="0" fontSize="12" baselineShift="sub" style={{ fontStyle: 'italic' }}>LI</tspan>
					</text>
					<text 
						x={14.5}
						y={105} 
						fill="#D3D8DE" 
						fontSize={13} 
						fontWeight="normal"
					>
						[M]
					</text>

					
					<text 
						x={10} // Position the text near the middle of the height
						y={144}  // Position the text slightly off the left edge
						fill="#D3D8DE" 
						fontSize={14} 
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

			<div style={{ marginTop: '4px', margin: '4' }}>
				{xAxisLabel === 'CI concentration' && (
					<div style={{ marginBottom: 0 }}></div>)}
				
				<svg width={190} height={38} > {/* Separate SVG for the gradient bar */}
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
					<text x={155} y={15} fontSize={11} textAnchor="start" fill="#D3D8DE">{colorMax.toFixed(0)}</text>
					{/* <text x={98} y={22} fontSize={11} textAnchor="start" fill="#D3D8DE">
						{'units'}
					</text> */}
				</svg>
				{xAxisLabel === 'CI concentration' && (
					<div style={{ marginBottom: -22 }}></div>)}
			</div>
		</div>
	);
};

export default SimpleHeatmap; 


