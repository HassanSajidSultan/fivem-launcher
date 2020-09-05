import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid } from '@material-ui/core';

import EventListener from './Events';
import Titlebar from '../../components/Titlebar';
import Splash from '../../components/SplashScreen';
import Authenticate from '../../components/Authenticate';
import Error from '../../components/Error';
import User from '../../components/User';

import genericBg from '../../assets/img/background.jpg';
import settingsBg from '../../assets/img/settings.jpg';

export default connect()((props) => {
	const loaded = useSelector((state) => state.app.loaded);
	const error = useSelector((state) => state.app.error);
	const screen = useSelector((state) => state.app.screen);
	const active = useSelector((state) => state.app.active);
	const selectedGame = useSelector((state) => state.app.selectedGame);
	const token = useSelector((state) => state.user.token);

	const useStyles = makeStyles((theme) => ({
		wrapper: {
			minHeight: '100vh',
			height: '100%',
			background: `url(${
				selectedGame != null &&
				(screen === 'games' || screen === 'changelogs') &&
				selectedGame.game.banner != null
					? selectedGame.game.banner
					: genericBg
			})`,
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			border: `1px solid ${active ? `${theme.palette.text.light}5e` : `${theme.palette.text.dark}2e`}`,
			transition: 'background ease-in 0.15s',
		},
		content: {
			position: 'relative',
			height: token != null ? 'calc(100vh - 99px)' : '100vh',
			width: '100vw',
		},
	}));

	const classes = useStyles();

	return (
		<div className={classes.wrapper}>
			<EventListener />
			{error ? (
				<Error />
			) : (
				<Grid container>
					{token != null ? (
						<Grid item xs={12}>
							<Titlebar />
						</Grid>
					) : null}
					<Grid item xs={12} className={classes.content}>
						{!loaded ? <Splash /> : token == null ? <Authenticate /> : <User />}
					</Grid>
				</Grid>
			)}
		</div>
	);
});
