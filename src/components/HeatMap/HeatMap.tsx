import React from 'react';
import { Group } from '@visx/group';
import genBins, { Bin, Bins } from '@visx/mock-data/lib/generators/genBins';
import { scaleLinear } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { scaleSequential } from 'd3-scale';
import { interpolateViridis, interpolateGreys, interpolatePlasma } from 'd3-scale-chromatic';
import { rgb } from 'd3-color';

export const background = '#1C2127';

function darkerColor(color: string) {
	const col = rgb(color);
	return col.darker(0.5).toString();
}

const margin = { top: 40, left: 50, right: 20, bottom: 30 };

type HeatMapProps = {
	title: string;
	color: string;
};

const HeatMap: React.FC<HeatMapProps> = ({title, color}) => {
	const binData = genBins(
		24,
		24,
		(idx) => 150 * idx,
		(i, number) => 25 * (number - i) * Math.random(),
	);

	const bins = (d: Bins) => d.bins;
	const count = (d: Bin) => d.count;

	const xScale = scaleLinear<number>({ domain: [0, binData.length] });
	const yScale = scaleLinear<number>({ domain: [0, binData[0].bins.length] });

	const colorMax = Math.max(...binData.map(d => Math.max(...bins(d).map(count))));

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

	const colorScale = colorScaleGenerator(color);

	const xAxisTitle = 'X Axis Title';
	const yAxisTitle = 'Y Axis Title';

	const width = 180 + margin.left + margin.right;
	const height = 180 + margin.top + margin.bottom;

	const xMax = width - margin.left - margin.right;
	const yMax = height - margin.top - margin.bottom;

	xScale.range([0, xMax]);
	yScale.range([yMax, 0]);

	return (
		<svg width={width} height={height}>
			<Group top={margin.top} left={margin.left}>
				<text
					x={xMax / 2}
					y={5}
					fontSize={16}
					textAnchor="middle"
					fill="#D3D8DE"
					style={{fontWeight:'500'}}
				>
					{title}
				</text>
				<text
					x={xMax / 2}
					y={yMax + 25}
					fontSize={14}
					textAnchor="middle"
					fill="#D3D8DE"
				>
					{xAxisTitle}
				</text>
				<text
					transform={`translate(${-8}, ${yMax / 2}) rotate(-90)`}
					fontSize={14}
					textAnchor="middle"
					fill="#D3D8DE"
				>
					{yAxisTitle}
				</text>
				<HeatmapRect
					data={binData}
					xScale={xScale}
					yScale={yScale}
					colorScale={colorScale}
					binWidth={xMax / binData.length}
					binHeight={yMax / binData[0].bins.length}
				>
					{heatmap => heatmap.map(heatmapBins => heatmapBins.map(bin => (
						<g key={`heatmap-rect-${bin.row}-${bin.column}`}>
							<defs>
								<linearGradient
									id={`heatmapGradient-${bin.row}-${bin.column}`}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="0%" stopColor={bin.color} />
									<stop offset="100%" stopColor={darkerColor(bin.color || '#000000')} />
								</linearGradient>
							</defs>
							<rect
								width={bin.width}
								height={bin.height}
								x={bin.x}
								y={bin.y}
								fill={`url(#heatmapGradient-${bin.row}-${bin.column})`}
							/>
						</g>
					)))}
				</HeatmapRect>
			</Group>
		</svg>
	);
};

export default HeatMap;
