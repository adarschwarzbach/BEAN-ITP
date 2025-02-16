import React, {useState} from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';
import './HeaderBanner.css';
import ProjectInfoPopup from '../Modals/ProjectInfoPopover';
import AdditionalPopup from '../Modals/AdditionalPopup';

interface Props {
    className?: string;
}

const HeaderBanner: React.FC<Props> = ({ className }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [additionalIsOpen, setAdditionalIsOpen] = useState(false);
	return (
		<Navbar className={`${className} .header-banner-class-name`}>
			<Navbar.Group align={Alignment.LEFT} className={`${className } background`}>
				<Navbar.Heading  className='pull-left'>
					<a href="https://microfluidics.stanford.edu/" className='lab-link'>
                    Stanford University Microfluidics Laboratory
					</a>
				</Navbar.Heading>
				<Navbar.Divider />
				<Navbar.Heading className='custom-title'> BEAN</Navbar.Heading>
			</Navbar.Group>
			<Navbar.Group align={Alignment.RIGHT}>
				<Button
					className="bp5-minimal"
					icon="manual"
					text="Nomenclature"
					onClick={() => window.open('https://nomenclature-public.s3.us-west-1.amazonaws.com/BEAN+nomenclature.pdf', '_blank')}
				/>
				<Button className="bp5-minimal" icon="info-sign" text="About" onClick={() => setAdditionalIsOpen(true)}/>
				<AdditionalPopup isOpen={additionalIsOpen} onClose={() => setAdditionalIsOpen(false)}/>
			</Navbar.Group>
		</Navbar>
	);
};

export default HeaderBanner;
