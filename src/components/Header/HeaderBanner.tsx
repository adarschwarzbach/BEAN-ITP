import React from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';

const HeaderBanner: React.FC = () => {
    return (
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>My Web App</Navbar.Heading>
                <Navbar.Divider />
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
                <Button className="bp3-minimal" icon="home" text="Home" />
                <Button className="bp3-minimal" icon="document" text="About" />
            </Navbar.Group>
        </Navbar>
    );
}

export default HeaderBanner;
