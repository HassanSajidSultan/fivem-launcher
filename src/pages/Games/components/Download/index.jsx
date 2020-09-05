import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { withStyles, makeStyles, Grid, Button, LinearProgress } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

const { remote, ipcRenderer } = window.require('electron');
const fs = remote.require('fs');

const ProgressDownload = withStyles((theme) => ({
	root: {
		height: 10,
	},
	colorPrimary: {
		backgroundColor: theme.palette.secondary.dark,
	},
	bar: {
		backgroundColor: theme.palette.primary.main,
	},
}))(LinearProgress);

const ProgressCopy = withStyles((theme) => ({
	root: {
		height: 10,
	},
	colorPrimary: {
		backgroundColor: theme.palette.secondary.dark,
	},
	bar: {
		backgroundColor: theme.palette.alt.green,
	},
}))(LinearProgress);

const useStyles = makeStyles((theme) => ({
	wrapper: {
		width: '100%',
		textAlign: 'left',
		height: 150,
		marginTop: '1vh',
		borderRight: 0,
		borderBottom: 0,
		position: 'absolute',
		bottom: 0,
		right: 0,
	},
	proggressWrapper: {
		display: 'inline-flex',
		alignItems: 'center',
		paddingRight: '5vh',
	},
	playWrapper: {
		lineHeight: '150px',
	},
	playBtn: {
		background: theme.palette.success.main,
		color: theme.palette.text.main,
		transition: 'background ease-in 0.15s, filter ease-in 0.15s',
		padding: 20,
		width: '90%',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		'&:hover': {
			background: theme.palette.success.main,
			filter: 'brightness(0.8)',
		},
		'& svg': {
			fontSize: 25,
			marginRight: 10,
		},
	},
	invalid: {
		background: theme.palette.error.main,
		color: theme.palette.text.main,
		transition: 'background ease-in 0.15s, filter ease-in 0.15s',
		padding: 20,
		width: '75%',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		'&:hover': {
			background: theme.palette.error.main,
			filter: 'brightness(0.8)',
		},
	},
	needToMod: {
		background: theme.palette.warning.main,
		color: theme.palette.text.main,
		transition: 'background ease-in 0.15s, filter ease-in 0.15s',
		padding: 20,
		width: '75%',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		'&:hover': {
			background: theme.palette.warning.main,
			filter: 'brightness(0.8)',
		},
	},
	invalidInstall: {
		textAlign: 'center',
		color: theme.palette.error.main,
		lineHeight: 'calc(29vh - 100px)',
	},
	fileStatus: {
		fontSize: 14,
		fontFamily: 'Kanit',
		paddingTop: 5,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const selectedGame = useSelector((state) => state.app.selectedGame);
	const selectedServer = useSelector((state) => state.app.selectedServer);
	const config = useSelector((state) => state.app.config);
	const gameConfig = selectedGame != null ? config.games[selectedGame.game.id] : null;
	const downloadPending =
		selectedGame != null ? useSelector((state) => state.patch.downloadPending[selectedGame.game.id]) : null;
	const downloading =
		selectedGame != null ? useSelector((state) => state.patch.downloading[selectedGame.game.id]) : null;
	const downloadStats =
		selectedGame != null ? useSelector((state) => state.patch.downloadStats[selectedGame.game.id]) : null;
	const filesFinished =
		selectedGame != null ? useSelector((state) => state.patch.filesFinished[selectedGame.game.id]) : null;

	const [server, setServer] = useState(null);
	useEffect(() => {
		if (selectedGame != null && selectedServer != null) {
			setServer(selectedServer[selectedGame.game.id]);
		} else {
			setServer(null);
		}
	}, [selectedGame, selectedServer]);

	const onPlay = () => {
		if (server != null) {
			let v = window.open(`fivem://connect/${server.ip}`, '_self');
			v.close();

			if (config.playBehavior === 'close') {
				ipcRenderer.invoke('close-event');
			} else if (config.playBehavior === 'minimize') {
				ipcRenderer.invoke('minimize-event');
			}
		} else {
			toast.error('Unable To Connect To Server');
		}
	};

	const onDownloadStart = () => {
		if (selectedGame != null && !downloading) {
			ipcRenderer.invoke('startDownload', selectedGame.game.id);
		}
	};

	const modGame = () => {
		if (selectedGame != null && !downloading) {
			ipcRenderer.invoke('modGame', selectedGame.game.id);
		}
	};

	return (
		<Grid container className={classes.wrapper}>
			{gameConfig == null || (gameConfig != null && gameConfig.gameLocation == null) ? (
				<Grid item xs={12} className={classes.invalidInstall}>
					Your Game Install Directory Is Not Setup.
				</Grid>
			) : (
				<>
					{downloadPending ? (
						<Grid item xs={3} className={classes.playWrapper}>
							<Button variant="contained" className={classes.invalid} onClick={onDownloadStart}>
								Update Required
							</Button>
						</Grid>
					) : (
						<Grid item xs={3} className={classes.playWrapper}>
							{downloading ? (
								<Button variant="contained" className={classes.invalid} disabled={true}>
									Download In Progress
								</Button>
							) : gameConfig != null && !fs.existsSync(`${gameConfig.gameLocation}\\reactrp.json`) ? (
								<Button variant="contained" className={classes.needToMod} onClick={modGame}>
									Mod Game
								</Button>
							) : selectedServer.online ? (
								<Button
									variant="contained"
									className={classes.playBtn}
									disabled={server == null}
									onClick={onPlay}
								>
									<FontAwesomeIcon icon={['fad', 'play']} />{' '}
									{server != null ? `Connect To Server` : ' Select A Server'}
								</Button>
							) : (
								<Button
									variant="contained"
									className={classes.invalid}
									disabled={true}
								>
									<FontAwesomeIcon icon={['fad', 'play']} />{' '}
									Server Offline
								</Button>
							)}
						</Grid>
					)}
					<Grid item xs={9} className={classes.proggressWrapper}>
						{downloading && downloadStats != null ? (
							<div style={{ width: '100%' }}>
								{downloading === 'Downloaded' ? (
									<ProgressDownload
										variant="determinate"
										value={Math.ceil((+downloadStats.downloaded / +downloadStats.total) * 100)}
									/>
								) : (
									<ProgressCopy
										variant="determinate"
										value={Math.ceil((+downloadStats.downloaded / +downloadStats.total) * 100)}
									/>
								)}
								{filesFinished != null ? (
									<span className={classes.fileStatus}>
										{filesFinished.length}/{downloadStats.count} Files {downloading}:{' '}
										{Math.ceil((+downloadStats.downloaded / +downloadStats.total) * 100)}%
									</span>
								) : null}
							</div>
						) : null}
					</Grid>
				</>
			)}
		</Grid>
	);
});
