import React, { useEffect } from 'react';
import { connect } from 'react-redux';

const { ipcRenderer } = window.require('electron');

export default connect()((props) => {
	useEffect(() => {
		props.dispatch({
			type: 'GAMES_LOADING',
		});
        props.dispatch({
            type: 'NEWS_LOADING'
        });

        ipcRenderer.invoke('getNews');
        ipcRenderer.invoke('fetchGames');
        ipcRenderer.invoke('evaluatePatches');
        
		let gameTimer = setInterval(() => {
			ipcRenderer.invoke('fetchGames', true);
		}, 60 * 1000);
        
		let newsTimer = setInterval(() => {
			ipcRenderer.invoke('getNews', true);
		}, 60 * 1000);
        
		let patchTimer = setInterval(() => {
			ipcRenderer.invoke('evaluatePatches', true);
		}, 60 * 1000 * 2.5);

		return () => {
            clearInterval(gameTimer);
			clearInterval(newsTimer);
			clearInterval(patchTimer);
		};
    }, []);

	return <></>;
});
