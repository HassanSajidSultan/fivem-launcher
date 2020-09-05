const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const path = require('path');
const axios = require('axios');
const log = require('electron-log');
const fs = require('fs');
const settings = require('electron-settings').default;
const isDev = require('electron-is-dev');
const keytar = require('keytar');

const { validateAppConfig, updateAppConfig, validateGameConfig, updateGameConfig } = require('./config');
const { validateToken, getUserDetails, getGames, getNews } = require('./actions');
const { checkForUpdates, startGameFileDownload, modGameClient } = require('./patches');

process.env['SITE_ADDRESS'] = 'https://localhost/';

let secondaryWin;
let authWindow;

global.LauncherConfig = null;
global.LauncherGames = null;
global.LauncherNews = null;

if (isDev || process.env.SITE_ADDRESS === 'https://localhost/') process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const createWindow = async () => {
	global.win = new BrowserWindow({
		backgroundColor: '#2A2A2A',
		width: 1600,
		height: 900,
		minWidth: 1000,
		minHeight: 730,
		maxWidth: 1600,
		maxHeight: 900,
		frame: false,
		show: false,
		title: 'React Roleplay',
		webPreferences: {
			nodeIntegration: true,
		},
		center: true,
		icon: path.join(__dirname, '../public/logo.ico'),
	});

	win.setMenu(null);
	if (isDev) {
		win.loadURL('http://localhost:3001');
	} else {
		// win.webContents.on('devtools-opened', () => {
		// 	win.webContents.closeDevTools();
		// });
		win.loadFile('build/index.html');
	}
	win.webContents.openDevTools();

	win.on('closed', () => (global.win = null));

	// This is the actual solution
	win.webContents.on('new-window', function (event, url) {
		if (url.startsWith('fivem://')) return;
		event.preventDefault();
		if (secondaryWin == null) {
			secondaryWin = new BrowserWindow({
				width: 1280,
				height: 720,
				title: 'React Roleplay',
				center: true,
				icon: path.join(__dirname, '../public/logo.ico'),
			});
			secondaryWin.removeMenu();
			secondaryWin.on('closed', () => (secondaryWin = null));
		}
		secondaryWin.loadURL(url);
	});

	validateAppConfig();
	if (settings.hasSync('games')) LauncherGames = settings.getSync('games');
	win.show();
};

app.on('browser-window-focus', () => {
	win.webContents.send('focused');
});

app.on('browser-window-blur', () => {
	win.webContents.send('blurred');
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (global.win === null) {
		createWindow();
	}
});

ipcMain.handle('minimize-event', () => {
	win.minimize();
});

ipcMain.handle('close-event', () => {
	app.quit();
});

ipcMain.handle('fetch-config', () => {
	win.webContents.send('receiveConfig', {
		storedSelectedServer: settings.getSync('selectedServer'),
		storedSelectedGame: settings.getSync('selectedGame'),
		config: LauncherConfig,
	});
});

ipcMain.handle('checkLogin', (event, type) => {
	let tkn = validateToken();
	if (tkn) {
		win.webContents.send('receiveToken', tkn.token);
	} else {
		win.webContents.send('noToken');
	}
});

ipcMain.handle('getUserDetails', (event, type) => {
	let tkn = validateToken();
	if (tkn) {
		if (settings.hasSync('userDetails')) {
			let details = settings.getSync('userDetails');
			if (details.expires > Date.now()) {
				win.webContents.send('receiveUserDetails', details.data);
			} else {
				settings.unsetSync('userDetails');
				getUserDetails(tkn);
			}
		} else {
			getUserDetails(tkn);
		}
	} else {
		win.webContents.send('noToken');
	}
});

ipcMain.handle('fetchGames', (event, ignoreIfSame) => {
	let tkn = validateToken();
	if (tkn) {
		if (LauncherGames != null) {
			if (LauncherGames.expires > Date.now()) {
				axios
					.get(`${process.env.SITE_ADDRESS}api/reactrp/servers/updated`, {
						headers: {
							Authorization: `Bearer ${tkn.token}`,
						},
					})
					.then((res) => {
						if (res.data.updated === LauncherGames.data.updated) {
							if (ignoreIfSame) return;
							validateGameConfig(LauncherGames.data.games);
							win.webContents.send('receiveGames', LauncherGames.data.games);
						} else {
							settings.unsetSync('games');
							LauncherGames = null;
							getGames(tkn);
						}
					})
					.catch((err) => {
						console.log(err);
						log.error('Error Occured Fetching Server Updated Time');
						win.webContents.send('errorOccured', 'Error Occured Fetching Server Updated Time');
					});
			} else {
				settings.unsetSync('games');
				LauncherGames = null;
				getGames(tkn);
			}
		} else {
			getGames(tkn);
		}
	} else {
		win.webContents.send('noToken');
	}
});

ipcMain.handle('evaluatePatches', (_) => {
	console.log('evaluatePatches');
	let tkn = validateToken();
	if (tkn) {
		checkForUpdates(tkn);
	}
});

ipcMain.handle('startDownload', (_, gId) => {
	console.log('startDownload');
	let tkn = validateToken();
	if (tkn) {
		startGameFileDownload(gId);
	}
});

ipcMain.handle('getNews', (event, ignoreIfSame = false, page = 1, perPage = 10) => {
	let tkn = validateToken();
	if (tkn) {
		if (LauncherNews != null) {
			if (LauncherNews.expires > Date.now() && page === LauncherNews.data.page && perPage === LauncherNews.data.perPage) {
				win.webContents.send('receiveNews', LauncherNews.data);
			} else {
				LauncherNews = null;
				getNews(tkn, ignoreIfSame, page, perPage);
			}
		} else {
			getNews(tkn, ignoreIfSame, page, perPage);
		}
	}
});

ipcMain.handle('selectGame', (_, gameId) => {
	settings.set('selectedGame', gameId);
});

ipcMain.handle('selectServer', (_, gameId, serverId) => {
	let s = settings.hasSync('selectedServer') ? settings.getSync('selectedServer') : Object();
	s[gameId] = serverId;
	settings.set('selectedServer', s);
});

ipcMain.handle('updateAppConfig', (_, key, value) => {
	updateAppConfig(key, value);
});

ipcMain.handle('updateGameConfig', (_, game, key, value) => {
	updateGameConfig(game, key, value);
});

ipcMain.handle('selectDownloadDirectory', async function(_, game) {
    let dir = await dialog.showOpenDialog(win, {
		defaultPath: LauncherConfig.downloadLocation,
        properties: ['openDirectory']
    });

    if(!dir.canceled) {
        try {
			updateAppConfig('downloadLocation', dir.filePaths[0])
        } catch(err) {
            win.webContents.send('toast', {
                type: 'error',
                message: err
            });
            console.log(err);
        }
    }
});

ipcMain.handle('selectGameDir', async function(_, game) {
    let dir = await dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    });

    if(!dir.canceled) {
        try {
            if(fs.existsSync(`${dir.filePaths[0]}\\${game.launcher.requiredFile}`)) {
				updateGameConfig(game.id, 'gameLocation', dir.filePaths[0]);
				let tkn = validateToken();
				if (tkn) {
					checkForUpdates(tkn);
				}
            } else {
                win.webContents.send('toast', 'error', `Invalid ${game.name} Install Location`);
                console.log(`Invalid ${game.name} Install Location`);
            }
        } catch(err) {
            win.webContents.send('toast', {
                type: 'error',
                message: err
            });
            console.log(err);
        }
    }
});

ipcMain.handle('unmodGame', (_, gId) => {
	//modGameClient(gId);
});

ipcMain.handle('modGame', (_, gId) => {
	modGameClient(gId);
});

ipcMain.handle('logout', () => {
	fs.unlinkSync(settings.file());
	win.webContents.session.clearCache()
	win.webContents.session.clearStorageData()
	win.webContents.send('loaded');
});

ipcMain.handle('login', (event, type) => {
	win.webContents.send('unloaded');
	settings.unsetSync('userDetails');
	authWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		show: false,
		title: 'Login',
		'node-integration': false,
		'web-security': false,
	});

	var authUrl = `${process.env.SITE_ADDRESS}oauth/authorize/?client_id=3ee6507b322b874cb3218d6b16028d93&response_type=token&scope=profile`;

	authWindow.loadURL(authUrl);
	authWindow.removeMenu();
	authWindow.show();
	authWindow.webContents.on('will-navigate', function (event, newUrl) {
		console.log(newUrl);
	});

	authWindow.on('closed', function () {
		authWindow = null;

		if (!settings.hasSync('token')) {
			win.webContents.send('loaded');
		}
	});

	const filter = { urls: ['http://localhost:12345/'] };

	session.defaultSession.webRequest.onBeforeRequest(filter, async function (details, callback) {
		if (authWindow != null) authWindow.close();
		const url = details.url;
		var urlParams = new URLSearchParams(url.split('#')[1]);

		if (urlParams.has('access_token')) {
			settings.setSync('token', {
				token: urlParams.get('access_token'),
				expires: Date.now() + parseInt(urlParams.get('expires_in') * 1000),
			});
			validateAppConfig();
			win.webContents.send('receiveToken', urlParams.get('access_token'));
		}

		callback({ cancel: false });
	});
});
