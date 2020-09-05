import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid, Avatar } from '@material-ui/core';

import Loader from '../../components/Loader';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
	wrapper: {
		width: '100%',
		height: '100%',
		textAlign: 'center',
		fontSize: 25,
		fontFamily: 'ReactRP',
		textShadow: `0 0 5px ${theme.palette.secondary.dark}5e`,
	},
	areaWrapperLeftFirst: {
		background: `${theme.palette.secondary.dark}14`,
		backdropFilter: 'blur(8px)',
		height: 'calc(100vh - 100px)',
		width: '100%',
		borderRight: `1px solid ${theme.palette.text.dark}2e`,
		overflowX: 'auto',
		padding: '15px 0',
		'&::-webkit-scrollbar': {
			width: 4,
		},
		'&::-webkit-scrollbar-track': {
			background: 'transparent',
		},
		'&::-webkit-scrollbar-thumb': {
			background: `${theme.palette.text.main}5e`,
		},
	},
	areaWrapperLeft: {
		background: `${theme.palette.secondary.dark}14`,
		backdropFilter: 'blur(8px)',
		height: 'calc(100vh - 100px)',
		width: '100%',
		borderRight: `1px solid ${theme.palette.text.dark}2e`,
		overflowX: 'auto',
		padding: '15px 0',
		'&::-webkit-scrollbar': {
			width: 4,
		},
		'&::-webkit-scrollbar-track': {
			background: 'transparent',
		},
		'&::-webkit-scrollbar-thumb': {
			background: `${theme.palette.text.main}5e`,
		},
	},
	areaWrapperRight: {
		height: 'calc(100vh - 100px)',
		width: '100%',
		paddingLeft: 10,
	},
	area: {
		height: '100%',
		width: '100%',
	},
	loadingText: {
		marginTop: 25,
	},
	dot1: {
		color: theme.palette.primary.main,
	},
	dot2: {
		color: theme.palette.text.main,
	},
	dot3: {
		color: '#0ad3ac',
	},
	gameLogo: {
		background: theme.palette.secondary.dark,
		height: 75,
		width: 75,
		margin: 'auto',
		color: theme.palette.text.main,
		border: `2px solid ${theme.palette.secondary.dark}`,
		marginBottom: 15,
		transition: 'box-shadow ease-in 0.15s, border ease-in 0.075s, filter ease-in 0.15s',
		'user-select': 'none',
		'& img': {
			'user-drag': 'none',
		},
		'&.active': {
			border: `2px solid ${theme.palette.primary.main}`,
			boxShadow: `0 0 25px ${theme.palette.secondary.dark}`,
		},
		'&:not(.active):hover': {
			border: `2px solid ${theme.palette.primary.main}5e`,
			cursor: 'pointer',
		},
		'&:hover': {
			cursor: 'pointer',
		},
	},
	highlight: {
		color: theme.palette.primary.main,
	},
	welcome: {
		height: '10vh',
		lineHeight: '10vh',
		fontSize: 30,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const loading = useSelector((state) => state.app.gamesLoading);
	const games = useSelector((state) => state.app.games);
	const selectedGame = useSelector((state) => state.app.selectedGame);

	const changeGame = (game) => {
		if (selectedGame.game.id === game.game.id) return;
		ipcRenderer.invoke('selectGame', game.game.id);
		props.dispatch({
			type: 'SET_SELECTED_GAME',
			payload: game,
		});
	};

	return (
		<div className={classes.wrapper}>
			{loading ? (
				<Loader text="Loading Content" size={75} />
			) : (
				<Grid container>
					<Grid item xs={2} sm={1} className={classes.areaWrapperLeftFirst}>
						<div className={classes.area}>
							{games.map((game, i) => {
								if (game.game.icon != null) {
									return (
										<Avatar
											key={`game-${i}`}
											className={`${classes.gameLogo}${
												selectedGame.game.id === game.game.id ? ' active' : ''
											}`}
											src={game.game.icon}
											alt={game.game.short.charAt(0)}
											title={game.game.name}
											onClick={() => changeGame(game)}
										/>
									);
								} else {
									return (
										<Avatar
											key={`game-${i}`}
											className={`${classes.gameLogo}${
												selectedGame.game.id === game.game.id ? ' active' : ''
											}`}
											title={game.game.name}
											onClick={() => changeGame(game)}
										>
											{game.game.short}
										</Avatar>
									);
								}
							})}
						</div>
					</Grid>
					<Grid item xs={2} className={classes.areaWrapperLeft}>
					</Grid>
					<Grid item xs={8} sm={9} className={classes.areaWrapperRight}>
						{selectedGame != null ? (
							<div className={classes.area}>
							</div>
						) : null}
					</Grid>
				</Grid>
			)}
		</div>
	);
});
