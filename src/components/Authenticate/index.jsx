import React from 'react';
import { makeStyles, Button } from '@material-ui/core';

const { shell, ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
    wrapper: {
        height: '100vw',
        width: '100vh',
		'-webkit-app-region': 'drag',
    },
	form: {
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
		'-webkit-app-region': 'none',
	},
	infoText: {
		marginTop: 25,
		fontSize: 11,
		textShadow: `0 0 5px ${theme.palette.secondary.dark}`,
		fontWeight: 'bold',
	},
	link: {
		color: theme.palette.alt.green,
		'-webkit-app-region': 'none',
		'&:hover': {
			cursor: 'pointer',
			textDecoration: 'underline',
		},
	},
}));

export default () => {
	const classes = useStyles();

	const onClick = () => {
        ipcRenderer.invoke('login');
    };

	return (
        <div className={classes.wrapper}>
            <div className={classes.form}>
                <div className={classes.welcomeText}>Welcome To React Roleplay</div>
                <Button className={classes.authBtn} variant="contained" color="primary" onClick={onClick}>
                    Login
                </Button>
                <div className={classes.infoText}>
                    Don't have a community account? Register at{' '}
                    <span
                        className={classes.link}
                        onClick={() => {
                            shell.openExternal('https://localhost/register');
                        }}
                    >
                        reactrp.com
                    </span>
                </div>
            </div>
        </div>
	);
};
