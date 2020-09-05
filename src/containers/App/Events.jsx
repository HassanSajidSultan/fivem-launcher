import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

const { ipcRenderer } = window.require('electron');

export default connect()((props) => {
	useEffect(() => {
		ipcRenderer.on('message', (_, type, payload) => {
			props.dispatch({
				type,
				payload,
			});
		});

		ipcRenderer.on('needToDownload', (_, game) => {
			props.dispatch({
				type: 'DOWNLOAD_REQUIRED',
				payload: {
					game,
				},
			});
		});

		ipcRenderer.on('downloadStarting', (_, gameId, type) => {
			props.dispatch({
				type: 'DOWNLOAD_STARTING',
				payload: {
					gameId,
					type,
				},
			});
		});

		ipcRenderer.on('initDownloadSettings', (_, game, total, count) => {
			props.dispatch({
				type: 'INIT_DOWNLOAD_STATS',
				payload: {
					game,
					total,
					count,
				},
			});
		});

		ipcRenderer.on('finishFileDownload', (_, game, file, count) => {
			props.dispatch({
				type: 'FINISH_FILE_DOWNLOAD',
				payload: {
					game,
					file,
				},
			});
		});

		ipcRenderer.on('downloadProgress', (_, game, downloaded) => {
			props.dispatch({
				type: 'DOWNLOAD_PROGRESS',
				payload: {
					game,
					downloaded,
				},
			});
		});

		ipcRenderer.on('finishDownload', (_, game) => {
			props.dispatch({
				type: 'DOWNLOAD_COMPLETE',
				payload: {
					game,
				},
			});
		});

		ipcRenderer.on('receiveConfig', (_, config) => {
			console.log(config);
			props.dispatch({
				type: 'APPLY_CONFIG',
				payload: config,
			});
		});

		ipcRenderer.on('focused', (_) => {
			props.dispatch({
				type: 'SET_ACTIVE',
				payload: true,
			});
		});

		ipcRenderer.on('blurred', (_) => {
			props.dispatch({
				type: 'SET_ACTIVE',
				payload: false,
			});
		});

		ipcRenderer.on('toast', (_, type, message) => {
			toast(message, {
				type: type,
			});
		});

		ipcRenderer.on('noToken', (_) => {
			props.dispatch({
				type: 'LOGOUT',
			});
			props.dispatch({
				type: 'LOADED',
			});
		});

		ipcRenderer.on('errorOccured', (_, err) => {
			props.dispatch({
				type: 'ERROR',
				payload: true,
			});
		});

		ipcRenderer.on('logout', (_) => {
			props.dispatch({
				type: 'LOGOUT',
			});
			props.dispatch({
				type: 'LOGOUT_APP',
			});
		});

		ipcRenderer.on('loaded', (_) => {
			props.dispatch({
				type: 'LOADED',
			});
		});

		ipcRenderer.on('unloaded', (_) => {
			props.dispatch({
				type: 'UNLOADED',
			});
		});
	}, []);

	return <></>;
});
