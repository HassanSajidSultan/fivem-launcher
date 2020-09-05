import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid, Avatar } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
	wrapper: {
		width: '100%',
		height: 'fit-content',
		fontFamily: 'Kanit,sans-serif',
		padding: 10,
		transition: 'background ease-in 0.15s',
		background: `${theme.palette.text.dark}3b`,
		border: `1px solid ${theme.palette.text.dark}2e`,
		textShadow: `0 0 5px ${theme.palette.secondary.dark}`,
		marginBottom: 2,
		'&.active': {
			background: `${theme.palette.primary.main}3b`,
		},
		'&.offline': {
			background: `${theme.palette.error.main}3b`,
		},
		'&:not(.active):not(.offline):hover': {
			background: `${theme.palette.secondary.dark}5e`,
			cursor: 'pointer',
		},
		'&.active:hover': {
			background: `${theme.palette.primary.main}14`,
			cursor: 'pointer',
		},
	},
	access: {
		textAlign: 'center',
	},
	offline: {
		color: theme.palette.error.dark,
		filter: `drop-shadow(0 0 10px ${theme.palette.secondary.dark}2e)`,
	},
	open: {
		color: theme.palette.success.main,
		filter: `drop-shadow(0 0 10px ${theme.palette.secondary.dark}2e)`,
	},
	whitelist: {
		color: theme.palette.error.main,
		filter: `drop-shadow(0 0 10px ${theme.palette.secondary.dark}2e)`,
	},
	test: {
		color: theme.palette.warning.main,
		filter: `drop-shadow(0 0 10px ${theme.palette.secondary.dark}2e)`,
	},
	count: {
		textAlign: 'right',
	},
	active: {
		color: theme.palette.primary.main,
		'&::after': {
			content: '"/"',
			color: theme.palette.text.main,
			marginLeft: 5,
			marginRight: 5,
		},
	},
	queue: {
		color: theme.palette.alt.green,
		'&::before': {
			content: '"("',
			color: theme.palette.text.main,
			marginLeft: 5,
		},
		'&::after': {
			content: '")"',
			color: theme.palette.text.main,
			marginRight: 5,
		},
	},
	name: {
		fontSize: 16,
	},
	motd: {
		fontSize: 12,
		color: theme.palette.alt.green,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const selectedGame = useSelector((state) => state.app.selectedGame);
	const selectedServer = useSelector((state) => state.app.selectedServer);

	const [server, setServer] = useState(null);
	useEffect(() => {
		if (selectedGame != null && selectedServer != null && (server == null || selectedServer.id !== server.id)) {
			setServer(selectedServer[selectedGame.game.id]);
		}
	}, [selectedGame, selectedServer]);

	let icon = <FontAwesomeIcon className={classes.offline} icon={['fad', 'power-off']} title="Server Offline" />;

	if (props.server.online) {
		switch (props.server.access) {
			case 'whitelist':
				icon = (
					<FontAwesomeIcon
						className={classes.whitelist}
						icon={['fad', 'lock-alt']}
						title="Access Restriction: Whitelist"
					/>
				);
				break;
			case 'test':
				icon = (
					<FontAwesomeIcon className={classes.test} icon={['fad', 'vial']} title="Access Restriction: Test" />
				);
				break;
			default:
				icon = (
					<FontAwesomeIcon
						className={classes.open}
						icon={['fad', 'lock-open']}
						title="Access Restriction: None"
					/>
				);
				break;
		}
	}

	const onClick = () => {
        if (!props.server.online) return;
        
		if (server != null && server.id === props.server.id) {
			ipcRenderer.invoke('selectServer', selectedGame.game.id, null);
			props.dispatch({
				type: 'SET_SELECTED_SERVER',
				payload: null,
			});
		} else {
			ipcRenderer.invoke('selectServer', selectedGame.game.id, props.server.id);
			props.dispatch({
				type: 'SET_SELECTED_SERVER',
				payload: props.server,
			});
		}
	};

	return (
		<Grid
			container
			className={`${classes.wrapper}${
				!props.server.online ? ' offline' : server != null && server.id === props.server.id ? ' active' : ''
			}`}
			onClick={onClick}
		>
			<Grid item xs={1} className={classes.access}>
				{icon}
			</Grid>
			<Grid item xs={8} className={classes.name}>
				<div>{props.server.name}</div>
				<div className={classes.motd}>{props.server.motd}</div>
			</Grid>
			<Grid item xs={3} className={classes.count}>
				<span className={classes.active}>{props.server.current}</span>
				{props.server.total}
				<span className={classes.queue}>?</span>
			</Grid>
		</Grid>
	);
});
