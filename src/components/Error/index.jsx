import React from 'react';
import { connect } from 'react-redux';
import { makeStyles, Button, ButtonGroup } from '@material-ui/core';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
	wrapper: {
		width: 'fit-content',
		height: 'fit-content',
		position: 'absolute',
		top: 0,
		bottom: 0,
		right: 0,
		left: 0,
		margin: 'auto',
		textAlign: 'center',
		padding: 25,
		background: `${theme.palette.secondary.dark}14`,
		backdropFilter: 'blur(8px)',
	},
	welcomeText: {
		fontFamily: 'ReactRP',
		color: theme.palette.text.main,
		fontSize: 25,
		marginBottom: 25,
	},
	authBtn: {
		width: 200,
	},
	infoText: {
		marginTop: 25,
		fontSize: 11,
		textShadow: `0 0 5px ${theme.palette.secondary.dark}`,
		fontWeight: 'bold',
	},
	link: {
		color: theme.palette.alt.green,
		'&:hover': {
			cursor: 'pointer',
			textDecoration: 'underline',
		},
	},
}));

export default connect()((props) => {
	const classes = useStyles();

	const onClick = () => {
		props.dispatch({
			type: 'ERROR',
			payload: false,
		})
    };

	const onClickLogout = () => {
        props.dispatch({
            type: 'LOGOUT'
        });
        props.dispatch({
            type: 'UNLOADED'
        });
        ipcRenderer.invoke('logout');
    };

	return (
		<div className={classes.wrapper}>
			<div className={classes.welcomeText}>Sorry, an error occured.</div>
            <ButtonGroup>
                <Button className={classes.authBtn} variant="contained" color="primary" onClick={onClick}>
                    Retry
                </Button>
                <Button className={classes.authBtn} variant="contained" color="primary" onClick={onClickLogout}>
                    Logout
                </Button>
            </ButtonGroup>
		</div>
	);
});
