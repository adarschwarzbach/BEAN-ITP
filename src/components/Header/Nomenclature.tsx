import React from 'react';
import './NomenclatureStyles.css'; // Assuming you have a CSS file for styling

const Nomenclature = () => {
	return (
		<div className="nomenclature">
			<h1>BEAN Nomenclature</h1>
			<p>Avaro A.S., Schwarzbach A., Jangra A., Bahga S.S., Santiago J.G. 03/05/2024</p>

			<section>
				<h2>A. Notation conventions</h2>
				<p>We use the following nomenclature:</p>
				<table>
					<thead>
						<tr>
							<th>Symbol</th>
							<th>Quantity</th>
							<th>Units</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>μ</td>
							<td>electrophoretic mobility</td>
							<td>10<sup>-8</sup> m²/(V.s)</td>
						</tr>
						<tr>
							<td>c</td>
							<td>molar concentration</td>
							<td>millimolar (mM)</td>
						</tr>
					</tbody>
				</table>
				<p>Subscripts indicate chemical species (e.g., the leading ion) and superscripts indicate the zone of interest (e.g., the leading electrolyte zone). Species type and zone abbreviations are listed in the tables below. For example, μ<sub>AATE</sub> and c<sub>LLIE</sub> refer to the effective mobility of the sample in the ATE region and the concentration of the leading ion within the leading electrolyte zone. μ<sub>Xo</sub> denotes the fully ionized mobility of species X and c<sub>Xi</sub> denotes the initial concentration of species X as specified in the user inputs.</p>
			</section>

			<section>
				<h2>B. ITP zones</h2>
				<table>
					<thead>
						<tr>
							<th>Abbreviation</th>
							<th>Zone Name</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>LE</td>
							<td>Leading electrolyte</td>
						</tr>
						<tr>
							<td>S</td>
							<td>Sample region</td>
						</tr>
						<tr>
							<td>ATE</td>
							<td>Adjusted trailing electrolyte</td>
						</tr>
						<tr>
							<td>TE</td>
							<td>Trailing electrolyte</td>
						</tr>
					</tbody>
				</table>
			</section>

			<section>
				<h2>C. Chemical species</h2>
				<p>Chemical species are indicated by the following:</p>
				<table>
					<thead>
						<tr>
							<th>Abbreviation</th>
							<th>Species Type</th>
							<th>Species present within</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>LI</td>
							<td>Leading ion</td>
							<td>LE</td>
						</tr>
						<tr>
							<td>CI</td>
							<td>Counter-ion</td>
							<td>LE, S, ATE, TE</td>
						</tr>
						{/* Add more rows as needed */}
					</tbody>
				</table>
			</section>

			<section>
				<h2>D. ITP checks</h2>
				<p>We implemented three checks on mobility values to ensure that the ITP condition was satisfied. That is we verify that the analyte would indeed be focused between the LE and ATE zones if the following conditions hold:</p>
				{/* Include detailed checks as described in the PDF */}
			</section>
		</div>
	);
};

export default Nomenclature;
