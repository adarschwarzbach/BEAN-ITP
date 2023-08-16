import React, {useState} from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';
import './HeaderBanner.css';
import ProjectInfoPopup from '../Modals/ProjectInfoPopover';

interface Props {
    className?: string; // This will allow you to pass a CSS class to your HeaderBanner component
}

const HeaderBanner: React.FC<Props> = ({ className }) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Navbar className={`${className}`}>
			<Navbar.Group align={Alignment.LEFT} className={`${className } background`}>
				<Navbar.Heading  className='pull-left'>
					<a href="https://microfluidics.stanford.edu/" className='lab-link'>
                    The Stanford University Microfluidics Laboratory
					</a>
				</Navbar.Heading>
				<Navbar.Divider />
				<Navbar.Heading className='custom-title'> BEAN</Navbar.Heading>
			</Navbar.Group>
			<Navbar.Group align={Alignment.RIGHT}>
				<Button className="bp5-minimal" icon="info-sign" text="About" onClick={() => setIsOpen(true)}/>
				<ProjectInfoPopup isOpen = {isOpen} onClose = {()=> setIsOpen(false)}/>
			</Navbar.Group>
		</Navbar>
	);
};

export default HeaderBanner;
