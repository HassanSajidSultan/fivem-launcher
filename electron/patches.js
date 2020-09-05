const { app } = require('electron');
const axios = require('axios');
const fs = require('fs');
const settings = require('electron-settings').default;
const log = require('electron-log');
const request = require('request');
const unzipper = require('unzipper');

let updateInProgress = Object();
let copyInProgress = Object();

let gameFileUpdates = Object();

async function checkGameFileUpdate(token, game) {
	return await axios
	.get(`${process.env.SITE_ADDRESS}api/reactrp/files/${game.id}`, {
		headers: {
			Authorization: `Bearer ${token.token}`,
		},
		withCredentials: true,
	})
	.then(async (res) => {
		let existing = Array();

		if (fs.existsSync(`${LauncherConfig.downloadLocation}\\${game.short}\\patches.json`)) {
			existing = JSON.parse(
				fs.readFileSync(`${LauncherConfig.downloadLocation}\\${game.short}\\patches.json`),
			);
		}

		let needToDownload = Array();
		let total = 0;
		await Promise.all(
			res.data.map(async (file) => {
				let e = existing.filter((f) => f.file === file.file)[0];

				if (
					e == null ||
					e.version !== file.version ||
					e.path !== file.path ||
					e.compressed !== file.compressed ||
					!fs.existsSync(`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}`)
				) {
					await axios.head(file.download).then((size) => {
						total += size.headers['content-length'] != null ? +size.headers['content-length'] : 0;
						needToDownload.push(file);
					});
				}
			}),
		);

		return { files: needToDownload, total: total, manifest: res.data };
	});
}

async function checkForUpdates(token) {
	if (!fs.existsSync(LauncherConfig.downloadLocation))
		fs.mkdirSync(LauncherConfig.downloadLocation, { recursive: true });

	if (LauncherGames == null) return;

	LauncherGames.data.games.map(async (gameData, i) => {
		let game = gameData.game;
		let gameConfig = LauncherConfig.games[game.id];
		if (gameConfig == null || gameConfig.gameLocation == null || updateInProgress[game.id]) return;
		if (!fs.existsSync(`${LauncherConfig.downloadLocation}\\${game.short}`))
			fs.mkdirSync(`${LauncherConfig.downloadLocation}\\${game.short}`, { recursive: true });

		updateInProgress[game.id] = true;
		gameFileUpdates[game.id] = await checkGameFileUpdate(token, game);

		log.info(`${game.short}: Total Download: ${gameFileUpdates[game.id].total} bytes`);
		if (gameFileUpdates[game.id].files.length > 0) {
			if (gameConfig.autoUpdate) {
				downloadPatches(game.id);
			} else {
				win.webContents.send('needToDownload', game.id);
				updateInProgress[game.id] = false;
			}
		} else {
			console.log(`Check Modded ${game.short}`);
			evaluateModdedGame(game, gameConfig);
		}
	});
}

function startGameFileDownload(gameId) {
	if (gameFileUpdates[gameId] == null) return;

	updateInProgress[gameId] = true;
	downloadPatches(gameId);
}

async function downloadPatches(gameId) {
	if (!updateInProgress[gameId]) {
		log.error(`Game ID ${gameId} has not been flagged as having an update in progress, preventing download from processing.`)
	}

	let { files, total, manifest } = gameFileUpdates[gameId];
	let game = LauncherGames.data.games.filter(g => g.game.id === gameId)[0];
	let gameConfig = LauncherConfig.games[gameId];

	if (game == null || gameConfig == null) {
		log.error(`Game or Game Config For Game ID ${gameId} not found.`);
		return;
	}
	game = game.game;

	win.webContents.send('downloadStarting', game.id, 'Downloaded');
	win.webContents.send('initDownloadSettings', game.id, total, files.length);

	var received_bytes = 0;
	await Promise.all(
		files.map((file, i) => {
			var req = request({
				method: 'GET',
				uri: file.download,
			});

			var out = fs.createWriteStream(`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}.tmp`);
			req.pipe(out);

			let throttle = null;
			req.on('data', function (chunk) {
				if (win == null) req.abort();

				// Update the received bytes
				received_bytes += chunk.length;

				if (throttle == null) {
					//console.log(Math.ceil(received_bytes / total * 100));
					if (win != null) win.webContents.send('downloadProgress', game.id, received_bytes);
					throttle = setTimeout(() => {
						throttle = null;
					}, 100);
				}
			});

			req.on('end', function () {
				log.info(
					`Downloaded ${file.file} To ${LauncherConfig.downloadLocation}\\${game.short} For Local Caching`,
				);

				if (fs.existsSync(`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}`)) {
					fs.unlinkSync(`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}`);
				}

				if (fs.existsSync(`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}.tmp`)) {
					fs.renameSync(
						`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}.tmp`,
						`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}`,
					);
				}

				if (win == null) req.abort();
				if (received_bytes >= total && win != null) {
					win.webContents.send('toast', 'success', 'File Downloaded 😀');
					win.webContents.send('finishDownload', game.id);

					fs.writeFileSync(
						`${LauncherConfig.downloadLocation}\\${game.short}\\patches.json`,
						JSON.stringify(
							manifest.map((c) => {
								delete c.download;
								return c;
							}),
							false,
							4,
						),
					);

					delete gameFileUpdates[game.id];
					updateInProgress[game.id] = false;
					evaluateModdedGame(game, gameConfig);
				} else {
					if (win != null) win.webContents.send('finishFileDownload', game.id, file.file);
				}
			});
		}),
	);
}

async function evaluateModdedGame(game, gameConfig) {
	if (gameConfig == null || gameConfig.gameLocation == null) return;
	if (!fs.existsSync(`${gameConfig.gameLocation}\\reactrp.json`)) return;

	let current = JSON.parse(fs.readFileSync(`${LauncherConfig.downloadLocation}\\${game.short}\\patches.json`));
	let existing = JSON.parse(fs.readFileSync(`${gameConfig.gameLocation}\\reactrp.json`));

	copyInProgress[game.id] = true;

	let needToCopy = Array();
	let total = 0;
	await Promise.all(
		existing.map((file) => {
			let e = current.filter((f) => f.file === file.file)[0];

			if (e == null) {
				log.info(
					`Removing ${file.file} from ${gameConfig.gameLocation}\\${file.path} as it is no longer present in the patches manifest`,
				);
				fs.unlinkSync(`${gameConfig.gameLocation}\\${file.path}\\${file.file}`);
			} else if (
				file.path !== e.path &&
				fs.existsSync(`${gameConfig.gameLocation}\\${file.path}\\${file.file}`)
			) {
				log.info(
					`Removing ${file.file} from ${gameConfig.gameLocation}\\${file.path} as its location has changed`,
				);
				fs.unlinkSync(`${gameConfig.gameLocation}\\${file.path}\\${file.file}`);
			}
		}),
	);

	await Promise.all(
		current.map((file) => {
			let e = existing.filter((f) => f.file === file.file)[0];

			if (
				e == null ||
				(file.path !== e.path && fs.existsSync(`${gameConfig.gameLocation}\\${e.path}\\${e.file}`)) ||
				file.version !== e.version ||
				!fs.existsSync(`${gameConfig.gameLocation}\\${file.path}\\${file.file}`) && !file.compressed
			) {
				needToCopy.push(file);
				total += fs.statSync(`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}`)['size'];
			}
		}),
	);

	console.log(`${game.short}: Total Copy: ${total} bytes`);
	if (needToCopy.length > 0) {
		win.webContents.send('downloadStarting', game.id, 'Copied');
		win.webContents.send('initDownloadSettings', game.id, total, needToCopy.length);
		copyPatches(needToCopy, total, current, game, gameConfig);
	}
}

async function copyPatches(needToCopy, total, manifest, game, gameConfig) {
	var received_bytes = 0;
	await Promise.all(
		needToCopy.map((file, i) => {
			if (!fs.existsSync(`${gameConfig.gameLocation}\\${file.path}`))
				fs.mkdirSync(`${gameConfig.gameLocation}\\${file.path}`, { recursive: true });

			let req = fs.createReadStream(`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}`);
			var out = file.compressed
				? unzipper.Extract({ path: `${gameConfig.gameLocation}\\${file.path}` })
				: fs.createWriteStream(`${gameConfig.gameLocation}\\${file.path}\\${file.file}`);
			req.pipe(out);

			let throttle = null;
			req.on('data', function (chunk) {
				if (win == null) req.abort();

				// Update the received bytes
				received_bytes += chunk.length;

				if (throttle == null) {
					//console.log(Math.ceil(received_bytes / total * 100));
					if (win != null) win.webContents.send('downloadProgress', game.id, received_bytes);
					throttle = setTimeout(() => {
						throttle = null;
					}, 100);
				}
			});

			req.on('end', function () {
				if (win == null) req.abort();
				if (received_bytes >= total && win != null) {
					win.webContents.send('toast', 'success', 'Files Moved 😀');
					win.webContents.send('finishDownload', game.id);

					copyInProgress[game.id] = false;
					fs.writeFileSync(`${gameConfig.gameLocation}\\reactrp.json`, JSON.stringify(manifest, false, 4));
				} else {
					if (win != null) win.webContents.send('finishFileDownload', game.id, file.file);
				}
			});
		}),
	);
}

async function modGameClient(gameId) {
	let game = LauncherGames.data.games.filter(g => g.game.id === gameId)[0];
	let gameConfig = LauncherConfig.games[gameId];

	if (game == null || gameConfig == null) {
		log.error(`[ameClient] Game or Game Config For Game ID ${gameId} not found.`);
		return;
	}
	game = game.game;

	copyInProgress[game.id] = true;

	let files = JSON.parse(fs.readFileSync(`${LauncherConfig.downloadLocation}\\${game.short}\\patches.json`));

	let needToCopy = Array();
	let total = 0;
	await Promise.all(
		files.map((file) => {
			needToCopy.push(file);
			total += fs.statSync(`${LauncherConfig.downloadLocation}\\${game.short}\\${file.file}`)['size'];
		}),
	);

	console.log(`${game.short}: Total Copy: ${total} bytes`);
	if (needToCopy.length > 0) {
		win.webContents.send('downloadStarting', game.id, 'Copied');
		win.webContents.send('initDownloadSettings', game.id, total, needToCopy.length);
		copyPatches(needToCopy, total, files, game, gameConfig);
	} else {
		copyInProgress[game.id] = false;
		fs.writeFileSync(`${gameConfig.gameLocation}\\reactrp.json`, JSON.stringify(manifest, false, 4));
	}
}

module.exports = {
	checkForUpdates,
	startGameFileDownload,
	modGameClient,
};
