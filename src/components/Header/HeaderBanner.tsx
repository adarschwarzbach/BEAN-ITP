import React, {useState} from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';
import './HeaderBanner.css';
import ProjectInfoPopup from '../Modals/ProjectInfoPopover';
import AdditionalPopup from '../Modals/AdditionalPopup';

interface Props {
    className?: string; // This will allow you to pass a CSS class to your HeaderBanner component
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
					onClick={() => window.open('https://nomenclature-bean.s3.us-west-1.amazonaws.com/Nomenclature.pdf?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGEaCXVzLWVhc3QtMSJIMEYCIQCCeke4u2F4ffD9sDf5PVvsMkYWCwuJfz9Y6zn7Ovck1wIhAKU1APjfJ9aJScCHrRtyZfjl5qPJYeQQZuX5MT5J0r6LKuQCCHkQARoMMDM5Mjg5MTYzOTAyIgwRuQlvcaFlL7zutuUqwQLU9WwJgDGT0VZcc%2FJGCkQ7jEkqUUHxbkNB60HA1CEo5ukKhJ7d5aWvayk6LRbCHsmZUP9W0EceHyBf4AbWsSB2RWxHy71os0m5W0E2qNoxP18feaOJWPOjGAW18IOlCc5bfFWnX144o46DLE58Zx3plNiTBXoCxkh4kazsapx%2B3me1Q%2F2eoUQkPMGiHT0VLoRTDWsAqyWhxDP9URRB75OrcwsfwCMAANAc9fhcZZAJzHL22eFCVl4sEAMmQgtN8giGA9oNHSJnx38KUiVJj3Ncgmns6KAdBBiGwbdG%2F250kkBG87dFxNhJ%2BmBdYetbmtE6BA%2B0jx7Qb3J7LsxTgjeZJEfMi9mi3OxwEEiOU1BspGD71c14YxLB9gMCUIV7VvgIUIySfAgd5rD80%2Bog0egF1vBamMSJcPonuZxQethW8yswuqSBsAY6sgK9hK29sF5wByFv0%2BsMSGpInbN84361Z0VyOb7u9a4fP24SdXPIuL1hDHvm3TbHG6MDnIYUpV53fmvc%2FpmwSUdLaXMcUVU9XYrYuyTbAMvsKFZhkHK%2BDCWYc61jpqjsHzmDI79EhcS%2BPt4jb1iCf%2F%2BOwOQE9EN7h3vVekUpy9Nb1cZHQq2nYqWLdEaYg920Ka%2FqJwK5yFXz%2FfGBbMrgDgg6Uad9V7qBZDvNt9yB%2BjHA37my7BG8fcndGLFtWcMZtpmV9HzZ2cFRuBLLiZ3T9AXITu%2Fa5fqXQ0rrMVBqxBD8Rzfyct7oxf7wgtFvK6i8YdTm0JTYYcKColFGPBEPT%2BX9mFXglZJplVHGggZvalh%2FZVbo4pugFDiw3VSU5gSXwza0H0mrFqCeaQFjNmshHW0dqsY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240324T162008Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAQSJORCB7P2IR7PLI%2F20240324%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=61ca359ebae6beb9001418d8005e49773fdc83d56f51a352c520287ad666b3b4', '_blank')}
				/>
				{/* <ProjectInfoPopup isOpen={isOpen} onClose={() => setIsOpen(false)} /> */}
				<Button className="bp5-minimal" icon="info-sign" text="About" onClick={() => setAdditionalIsOpen(true)}/>
				<AdditionalPopup isOpen={additionalIsOpen} onClose={() => setAdditionalIsOpen(false)}/>
			</Navbar.Group>
		</Navbar>
	);
};

export default HeaderBanner;
