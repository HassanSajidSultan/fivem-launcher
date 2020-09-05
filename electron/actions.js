const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const axios = require('axios');
const log = require('electron-log');
const settings = require('electron-settings').default;
const isDev = require('electron-is-dev');
const keytar = require('keytar');

const { validateGameConfig } = require('./config');

function validateToken() {
	if (settings.hasSync('token')) {
		let tkn = settings.getSync('token');

		if (tkn.expires > Date.now()) {
			return tkn;
		} else {
			settings.unsetSync('token');
			return false;
		}
	} else {
		return false;
	}
}

function getUserDetails(token) {
	axios
		.get(`${process.env.SITE_ADDRESS}api/core/me`, {
			headers: {
				Authorization: `Bearer ${token.token}`,
			},
			withCredentials: true,
		})
		.then((res) => {
			settings.set('userDetails', {
				expires: Date.now() + 60 * 1000 * 30,
				data: res.data,
			});
			win.webContents.send('receiveUserDetails', res.data);
		})
		.catch((err) => {
			console.log(err);
			log.error('Error Occured Fetching User Details');
			win.webContents.send('errorOccured', 'Error Occured Fetching User Details');
		});
}

function getGames(token) {
	axios
		.get(`${process.env.SITE_ADDRESS}api/reactrp/launcher/games`, {
			headers: {
				Authorization: `Bearer ${token.token}`,
			},
			withCredentials: true,
		})
		.then((res) => {
			let g = {
				expires: Date.now() + 60 * 1000 * 30,
				data: res.data,
			};
			LauncherGames = g;
			settings.set('games', g);
			validateGameConfig(res.data.games);
			win.webContents.send('receiveGames', res.data.games);
		})
		.catch((err) => {
			console.log(err);
			log.error('Error Occured Fetching Games');
			win.webContents.send('errorOccured', 'Error Occured Fetching Games');
		});
}

function getNews(token, ignoreIfSame, page, perPage) {
	axios
		.get(`${process.env.SITE_ADDRESS}api/reactrp/launcher/news`, {
			headers: {
				Authorization: `Bearer ${token.token}`,
			},
			withCredentials: true,
		})
		.then((res) => {
			axios
				.get(
					`${process.env.SITE_ADDRESS}api/forums/topics?forums=${res.data}&page=${page}&perPage=${
						perPage > 100 ? 100 : perPage < 1 ? 1 : perPage
					}`,
					{
						headers: {
							Authorization: `Bearer ${token.token}`,
						},
						withCredentials: true,
					},
				)
				.then((res) => {
					let sorted = res.data.results.sort((a, b) => {
						let aDate = new Date(a.firstPost.date);
						let bDate = new Date(b.firstPost.date);

						return bDate - aDate;
					});

					LauncherNews = {
						expires: Date.now() + 60 * 1000 * 5,
						data: {
							pages: res.data.totalPages,
							page: res.data.page,
							perPage: res.data.perPage,
							total: res.data.totalResults,
							posts: sorted,
						},
					};

					win.webContents.send('receiveNews', LauncherNews.data);
				})
				.catch((err) => {
					console.log(err);
					log.error('Error Occured Feteching News Posts');
					win.webContents.send('errorOccured', 'Error Occured Feteching News Posts');
				});
		})
		.catch((err) => {
			console.log(err);
			log.error('Error Occured Feteching News Posts');
			win.webContents.send('errorOccured', 'Error Occured Feteching News Posts');
		});
}

module.exports = {
    validateToken,
    getUserDetails,
    getGames,
    getNews,
}