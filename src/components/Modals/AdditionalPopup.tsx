
import React from 'react';
import { Dialog, Button } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdditionalPopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
	return (
		<Dialog
			className="bp5-dark" 
			icon="info-sign"
			onClose={onClose}
			title="About BEAN"
			isOpen={isOpen}
			style={{
				padding: '12px',
				width: '65%',
				maxWidth: '700',
				textAlign: 'center'
			}}
		>
			<div style={{
				padding: '20px',
				marginBottom: '20px'
			}}>
				<div>
					<p>
						A. S. Avaro‡, A. Schwarzbach‡, A. Jangra, S. S. Bahga, and J. G. Santiago. <br />&quot;Highly Parallel Simulation Tool for the Design of Isotachophoresis Experiments&quot;, under review, 2024.
					</p>
					<p>
						‡Equal contribution.
					</p>
					<p>
						*If you use this tool as part of any published work, please cite this paper.
					</p>
				</div>
			</div>

			<div style={{
				padding: '10px 20px',
				display: 'flex',
				justifyContent: 'center'
			}}>
			</div>
		</Dialog>
	);
};

export default AdditionalPopup;
