// ProjectInfoPopup.tsx
import React from 'react';
import { Dialog, Button } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProjectInfoPopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
	return (
		<Dialog
			className="bp5-dark"  // Add bp5-dark for dark mode
			icon="info-sign"
			onClose={onClose}
			title="Project Information"
			isOpen={isOpen}
			style={{
				padding: '24px',
				width: '50%',
				maxWidth: '600px',
				textAlign: 'center'
			}}
		>
			<div style={{
				padding: '20px',
				marginBottom: '20px'
			}}>
				<p>Information about BEAN.</p>
				<p>Or something else if you want :)</p>
			</div>

			<div style={{
				padding: '10px 20px',
				display: 'flex',
				justifyContent: 'center'
			}}>
				{/* <Button onClick={onClose}>Close</Button> */}
			</div>
		</Dialog>
	);
};

export default ProjectInfoPopup;
