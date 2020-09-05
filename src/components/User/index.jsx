import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';

import Polls from '../../containers/Launcher/Polls';

import Settings from '../../pages/Settings';
import Games from '../../pages/Games';
import News from '../../pages/News';
import Changelogs from '../../pages/Changelog';

export default connect()((props) => {
    const token = useSelector((state) => state.user.token);
    const screen = useSelector((state) => state.app.screen);

    const [el, setEl] = useState(null);
    useEffect(() => { 
        if (token != null) {
            switch(screen) {
                case 'news':
                    setEl(<News />);
                    break;
                case 'changelogs':
                    setEl(<Changelogs />);
                    break;
                case 'settings':
                    setEl(<Settings />);
                    break;
                case 'games':
                default:
                    setEl(<Games />);
                    break;
            }
        }
    }, [screen]);
    
    return (
        <>
            <Polls />
            {el}
        </>
    )
});
