export const initialState = {
	token: null,
    session: null,
	mode: 'dark'
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'LOGIN':
			return {
                ...state,
                token: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                token: null,
                session: null,
            };
        case 'SET_USER_DATA':
            return {
                ...state,
                session: action.payload
            }
		case 'SET_THEME':
			return {
				...state,
				mode: action.payload
			}
		default:
			return state;
	}
};