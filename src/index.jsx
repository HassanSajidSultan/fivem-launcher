import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';

import { configureStore } from './configureStore';
import App from './containers/App';

const initialState = {};
const store = configureStore(initialState);
const MOUNT_NODE = document.getElementById('root');

ReactDOM.render(
	<React.Fragment>
		<Provider store={store}>
			<App />
		</Provider>
	</React.Fragment>,
	MOUNT_NODE,
);
