// ProjectInfoPopup.tsx
import React from 'react';
import { Dialog, Button } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import Nomenclature from '../Header/Nomenclature';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProjectInfoPopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
	return (
		<Dialog
			className="bp5-dark"  // Add bp5-dark for dark mode
			icon="manual"
			onClose={onClose}
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
				<Nomenclature />
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

export default ProjectInfoPopup;
