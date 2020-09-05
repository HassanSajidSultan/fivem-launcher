import { applyMiddleware, createStore } from 'redux';
import createReducer from './reducers';
import { createHashHistory } from 'history';
import thunk from 'redux-thunk';
import createRootReducer from './reducers';

const history = createHashHistory();
const rootReducer = createRootReducer(history);

const configureStore = (initialState) => {
	const store = createStore(rootReducer, initialState, applyMiddleware(thunk));

	if (module.hot) {
		module.hot.accept('./reducers', () => {
			store.replaceReducer(createReducer(store.injectedReducers));
		});
	}

	return store;
};

export { configureStore, history };
