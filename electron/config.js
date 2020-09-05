const { app } = require('electron');
const settings = require('electron-settings').default;

const CONFIG_MAP = {
	playBehavior: 'nothing',
	autoUpdate: true,
	downloadLocation: `${app.getPath('appData')}\\${app.getName()}\\files`,
	games: {},
};

const GAME_CONFIG_MAP = {
	autoUpdate: true,
	gameLocation: null,
	modded: false,
};

function validateAppConfig() {
	if (settings.hasSync('config')) {
		LauncherConfig = settings.getSync('config');
		let modified = false;
		Object.keys(CONFIG_MAP).map((k) => {
			if (LauncherConfig[k] == null) {
				LauncherConfig[k] = CONFIG_MAP[k];
				modified = true;
			}
		});
        if (modified) settings.set('config', LauncherConfig);
	} else {
		settings.set('config', CONFIG_MAP);
		LauncherConfig = CONFIG_MAP;
	}

    win.webContents.send('receiveConfig', {
        storedSelectedServer: settings.getSync('selectedServer'),
        storedSelectedGame: settings.getSync('selectedGame'),
        config: LauncherConfig,
    });
}

function updateAppConfig(key, value) {
	LauncherConfig = {
		...LauncherConfig,
		[key]: value,
	};
    settings.set('config', LauncherConfig);
	win.webContents.send('receiveConfig', {
		config: LauncherConfig,
	});
}

function validateGameConfig(games) {
	let modified = false;
	games.map((game) => {
		if (LauncherConfig.games[game.game.id] == null) {
			LauncherConfig.games[game.game.id] = GAME_CONFIG_MAP;
			modified = true;
		}
	});
    if (modified) settings.set('config', LauncherConfig);
    
    win.webContents.send('receiveConfig', {
        storedSelectedServer: settings.getSync('selectedServer'),
        storedSelectedGame: settings.getSync('selectedGame'),
        config: LauncherConfig,
    });
}

function updateGameConfig(gameId, key, value) {
	LauncherConfig = {
		...LauncherConfig,
		games: {
			...LauncherConfig.games,
			[gameId]: {
				...LauncherConfig.games[gameId],
				[key]: value,
			},
		},
	};
	settings.set('config', LauncherConfig);
	win.webContents.send('receiveConfig', {
		config: LauncherConfig,
	});
}

module.exports = {
	validateAppConfig,
	updateAppConfig,
	validateGameConfig,
	updateGameConfig,
};
