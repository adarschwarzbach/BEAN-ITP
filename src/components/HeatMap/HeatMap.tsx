import React from 'react';
import { Group } from '@visx/group';
import genBins, { Bin, Bins } from '@visx/mock-data/lib/generators/genBins';
import { scaleLinear } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { getSeededRandom } from '@visx/mock-data';
import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { rgb } from 'd3-color';


export const background = '#28272c';

const seededRandom = getSeededRandom(0.41);

const binData = genBins(
	16,
	16,
	(idx) => 150 * idx,
	(i, number) => 25 * (number - i) * seededRandom(),
);

const bins = (d: Bins) => d.bins;
const count = (d: Bin) => d.count;

const colorMax = Math.max(...binData.map(d => Math.max(...bins(d).map(count))));

const xScale = scaleLinear<number>({
	domain: [0, binData.length],
});
const yScale = scaleLinear<number>({
	domain: [0, binData[0].bins.length],
});

const colorScale = scaleSequential(interpolateViridis)
	.domain([0, colorMax]);

    
function darkerColor(color: string) {
	const col = rgb(color);
	return col.darker(1.5).toString();  // 1.5 is the factor, you can adjust this
}

export type HeatmapProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const margin = { top: 10, left: 20, right: 20, bottom: 10 };
const width = 500;
const height = 500;
const HeatMap = () => {
	const xMax = width - margin.left - margin.right;
	const yMax = height - margin.top - margin.bottom;
  
	xScale.range([0, xMax]);
	yScale.range([yMax, 0]);
  
	return (
		<svg width={width} height={height}>
			<rect x={0} y={0} width={width} height={height} rx={14} fill={background} />
			<Group top={margin.top} left={margin.left}>
				<HeatmapRect
					data={binData}
					xScale={xScale}
					yScale={yScale}
					colorScale={colorScale}
					binWidth={xMax / binData.length}
					binHeight={yMax / binData[0].bins.length}
				>
					{heatmap =>
						heatmap.map(heatmapBins =>
							heatmapBins.map(bin => (
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
							))
						)
					}
				</HeatmapRect>
			</Group>
		</svg>
	);
};
    

export default HeatMap;
