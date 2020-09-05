import React, { useEffect } from 'react';
import { connect } from 'react-redux';

const { ipcRenderer } = window.require('electron');

export default connect()((props) => {
	useEffect(() => {
		ipcRenderer.on('receiveToken', (_, token) => {
			props.dispatch({
				type: 'LOGIN',
				payload: token,
			});
			props.dispatch({
				type: 'LOADED',
			});
			ipcRenderer.invoke('getUserDetails');
		});

		ipcRenderer.on('receiveUserDetails', (_, data) => {
			props.dispatch({
				type: 'SET_USER_DATA',
				payload: data,
			});
		});

		ipcRenderer.on('receiveGames', (_, data) => {
			props.dispatch({
				type: 'SET_GAMES',
				payload: data,
			});
		});

		ipcRenderer.on('receiveNews', (_, data) => {
			props.dispatch({
				type: 'SET_NEWS',
				payload: data,
			});
		});

		ipcRenderer.invoke('checkLogin');
	}, []);

	return <></>;
});
