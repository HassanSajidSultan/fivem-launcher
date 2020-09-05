import { combineReducers } from 'redux';

import appReducer from './appReducer';
import userReducer from './userReducer';
import patchReducer from './patchReducer';

export default () =>
	combineReducers({
        app: appReducer,
		user: userReducer,
		patch: patchReducer,
	});
