import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, IconButton, Button, Divider, Avatar, Menu, MenuItem, Grow } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Logo from '../../assets/img/Logo.png';

const { shell, ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: 10,
		background: `#ffffff14`,
		width: '100%',
		'-webkit-app-region': 'drag',
		zIndex: 0,
		backdropFilter: 'blur(8px)',
		borderBottom: `1px solid ${theme.palette.text.dark}2e`,
	},
	logoBar: {
		width: 'fit-content',
		display: 'inline-flex',
		alignItems: 'center',
		fontSize: 15,
		'-webkit-app-region': 'none',
		zIndex: 1,
	},
	menu: {
		background: theme.palette.secondary.dark,
		borderRadius: 0,
	},
	settingsBtn: {
		color: theme.palette.secondary.dark,
		display: 'inline-flex',
		alignItems: 'center',
		'&:hover': {
			color: theme.palette.primary.light,
			transition: 'color ease-in 0.15s',
			background: 'transparent',
		},
	},
	logo: {
		height: 75,
		'user-drag': 'none',
	},
	indicatorFocused: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		margin: 'auto',
		height: 7,
		width: '75%',
		background: `${theme.palette.text.light}5e`,
		borderBottomLeftRadius: 200,
		borderBottomRightRadius: 200,
		transition: 'background ease-in 0.0375',
	},
	indicatorNotocused: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		margin: 'auto',
		height: 7,
		width: '75%',
		background: `${theme.palette.text.dark}2e`,
		borderBottomLeftRadius: 200,
		borderBottomRightRadius: 200,
		transition: 'background ease-in 0.0375',
	},
	windowActions: {
		position: 'absolute',
		top: 0,
		right: 0,
		padding: 5,
	},
	actionButton: {
		zIndex: 10,
		'-webkit-app-region': 'none',
		color: theme.palette.secondary.dark,
	},
	actionIcon: {
		display: 'inline-block',
		fontSize: 15,
	},
	userData: {
		display: 'inline-flex',
		alignItems: 'center',
		position: 'absolute',
		right: '2%',
		bottom: '15%',
		'-webkit-app-region': 'none',
	},
	avatar: {
		marginRight: -10,
		border: `1px solid ${theme.palette.border.divider}`,
		zIndex: 100,
	},
	userName: {
		padding: '5px 5px 5px 15px',
		border: `1px solid ${theme.palette.border.divider}`,
		borderRadius: 4,
		background: `${theme.palette.secondary.dark}14`,
		color: theme.palette.text.light,
		textShadow: `0 0 5px ${theme.palette.secondary.dark}`,
		fontWeight: 'bold',
		textTransform: 'none',
	},
	navItem: {
		padding: 15,
		fontSize: 25,
		color: `${theme.palette.text.main}ba`,
		textTransform: 'uppercase',
		'user-select': 'none',
		'user-drag': 'none',
		position: 'relative',
		'&:hover': {
			color: theme.palette.text.light,
			transition: 'color ease-in 0.15s',
			cursor: 'pointer',
		},
		'&:active:hover': {
			position: 'relative',
			top: 1,
			left: 1,
			transition: 'all ease-in 0.15s',
		},
		'&.active': {
			color: theme.palette.text.light,
			textShadow: `0 0 5px ${theme.palette.text.light}`,
		},
		'& svg': {
			display: 'inline-block',
			position: 'absolute',
			fontSize: 15,
			top: 0,
			bottom: 0,
			right: -5,
			margin: 'auto',
		}
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const screen = useSelector((state) => state.app.screen);
	const isActive = useSelector((state) => state.app.active);
	const userData = useSelector((state) => state.user.session);
	const gamesRefreshing = useSelector((state) => state.app.gamesRefreshing);

	const gameLoadTime = useSelector((state) => state.app.gameLoadTime);

	const [currTime, setCurrTime] = useState(Date.now());
	useEffect(() => {
		let t = setInterval(() => {
			setCurrTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(t);
		};
	}, []);

	const refreshGames = () => {
		ipcRenderer.invoke('fetchGames');
	};

	const minimizeHandler = () => {
		ipcRenderer.invoke('minimize-event');
	};

	const closeHandler = () => {
		ipcRenderer.invoke('close-event');
	};

	const changeScreen = (newScreen) => {
		handleMenuClose();
		props.dispatch({
			type: 'CHANGE_SCREEN',
			payload: newScreen,
		});
	};

	const [anchorEl, setAnchorEl] = useState(null);
	const [open, setOpen] = useState(false);

	const onClick = (e) => {
		e.preventDefault();
		setAnchorEl(e.currentTarget);
		setOpen(!open);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setOpen(false);
	};

	const logout = () => {
		props.dispatch({
			type: 'UNLOAD',
		});
		props.dispatch({
			type: 'LOGOUT',
		});
		props.dispatch({
			type: 'LOGOUT_APP',
		});
		ipcRenderer.invoke('logout');
	};

	return (
		<div className={classes.wrapper}>
			<div className={isActive ? classes.indicatorFocused : classes.indicatorNotocused} />
			<div className={classes.logoBar}>
				<Button className={classes.settingsBtn} onClick={() => changeScreen('settings')}>
					<img src={Logo} className={classes.logo} alt="React RP" />
				</Button>
				<Divider orientation="vertical" flexItem />
				<div className={classes.mainNav}>
					<span
						className={`${classes.navItem}${screen === 'games' ? ' active' : ''}`}
						onClick={() => changeScreen('games')}
					>
						Games
					</span>
					<span
						className={`${classes.navItem}${screen === 'news' ? ' active' : ''}`}
						onClick={() => changeScreen('news')}
					>
						News
					</span>
					<span
						className={`${classes.navItem}${screen === 'changelogs' ? ' active' : ''}`}
						onClick={() => changeScreen('changelogs')}
					>
						Changelogs
					</span>
					<span
						className={classes.navItem}
						onClick={() => {
							shell.openExternal('https://discord.gg/sHReANf');
						}}
					>
						<FontAwesomeIcon icon={['fad', 'external-link']} />
						Discord
					</span>
				</div>
			</div>
			{userData != null ? (
				<div className={classes.userData}>
					<Avatar className={classes.avatar} src={userData.photoUrl} alt={userData.name.charAt(0)} />
					<Button color="secondary" className={classes.userName} onClick={onClick} name="account">
						{userData.name}
					</Button>
				</div>
			) : null}
			<div className={classes.windowActions}>
				{gameLoadTime != null ? (
					<IconButton
						color="secondary"
						className={classes.actionButton}
						onClick={refreshGames}
						disabled={currTime <= gameLoadTime}
					>
						<FontAwesomeIcon className={classes.actionIcon} icon={['fad', 'sync']} spin={gamesRefreshing} />
					</IconButton>
				) : null}
				<IconButton color="secondary" className={classes.actionButton} onClick={minimizeHandler}>
					<FontAwesomeIcon className={classes.actionIcon} icon={['fad', 'minus']} />
				</IconButton>
				<IconButton color="secondary" className={classes.actionButton} onClick={closeHandler}>
					<FontAwesomeIcon className={classes.actionIcon} icon={['fad', 'times']} />
				</IconButton>
			</div>
			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				open={open && anchorEl.name === 'account'}
				onClose={handleMenuClose}
				PaperProps={{ className: classes.menu }}
				TransitionComponent={Grow}
			>
				<MenuItem onClick={logout}>Logout</MenuItem>
			</Menu>
		</div>
	);
});
