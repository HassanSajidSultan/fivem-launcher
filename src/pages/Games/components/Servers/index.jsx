import React from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Server from './Server';

const useStyles = makeStyles((theme) => ({
	wrapper: {
        maxHeight: '40vh',
		background: `${theme.palette.secondary.dark}2e`,
		backdropFilter: 'blur(8px)',
        padding: '1vh',
        textAlign: 'left',
        border: `1px solid ${theme.palette.text.dark}2e`,
        borderRight: 0,
    },
    header: {
        width: '100%',
        display: 'inline-flex',
        height: '5vh',
        alignItems: 'center',
        padding: '1vh',
        fontSize: 16,
        marginBottom: '2vh',
        borderBottom: `1px solid ${theme.palette.text.main}`,
    },
    count: {
        color: theme.palette.alt.green,
        marginRight: 10,
    },
    serversList: {
        maxHeight: '29vh',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            width: 4,
        },
        '&::-webkit-scrollbar-track': {
            background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
            background: `${theme.palette.text.main}5e`,
        }
    },
    noServers: {
        textAlign: 'center',
        color: theme.palette.error.main,
    }
}));

export default connect()((props) => {
	const classes = useStyles();
	const selectedGame = useSelector((state) => state.app.selectedGame);

	return (
		<Grid xs={6} className={classes.wrapper}>
            <div className={classes.header}>
                <span className={classes.count}>
                    {selectedGame.length}
                </span>
                <span>
                    Active Servers
                </span>
            </div>
            <div className={classes.serversList}>
                {
                    selectedGame.servers.length > 0 ? selectedGame.servers.map((server, i) => {
                        return(<Server key={`server-${i}`} server={server} />)
                    }) :
                    <div className={classes.noServers}>
                        This Game Has No Servers That You Can Access
                    </div>
                }
            </div>
		</Grid>
	);
});
