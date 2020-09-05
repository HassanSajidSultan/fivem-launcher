export const initialState = {
	modded: false,
	loaded: false,
	error: false,
	active: false,
	screen: 'games',
	mode: 'dark',
	gamesLoading: false,
	gamesRefreshing: false,
	selectedGame: null,
	selectedServer: null,
	games: Array(),
	gameLoadTime: null,
	newsLoading: false,
	newsPosts: null,
	config: { games: Object() }
};

export default (state = initialState, action) => {
	switch (action.type) {
        case 'LOGOUT_APP':
            return {
                ...initialState
            }
		case 'APPLY_CONFIG':
			return {
				...state,
				...action.payload,
			};
		case 'LOADED':
			return {
				...state,
				loaded: true,
			};
		case 'UNLOADED':
			return {
				...state,
				loaded: false,
			};
		case 'ERROR':
			return {
				...state,
				error: action.payload,
			};
		case 'GAMES_LOADING':
			return {
				...state,
				gamesLoading: true,
			};
		case 'GAMES_REFRESHING':
			return {
				...state,
				gamesRefreshing: true,
			};
		case 'CHANGE_SCREEN':
			return {
				...state,
				screen: action.payload,
			};
		case 'SET_ACTIVE':
			return {
				...state,
				active: action.payload,
			};
		case 'SET_THEME':
			return {
				...state,
				mode: action.payload,
			};
		case 'SET_GAMES':
			let storedServers = {};
			if (state.selectedServer == null && state.storedSelectedServer != null) {
				action.payload.map((game) => {
					if (state.storedSelectedServer[game.game.id] != null) {
						let res = game.servers.filter((s) => s.id === state.storedSelectedServer[game.game.id]);
						if (res.length > 0) {
							storedServers[game.game.id] = res[0];
						} else {
							storedServers[game.game.id] = null;
						}
					} else {
						storedServers[game.game.id] = null;
					}
				});
			}

			console.log(state.storedSelectedGame)

			return {
				...state,
				gamesLoading: false,
				gamesRefreshing: false,
				games: action.payload,
				gameLoadTime: Date.now() + 60 * 1000 * 10,
				selectedGame:
					state.selectedGame != null
						? action.payload.filter((g) => g.game.id === state.selectedGame.game.id).length > 0
							? action.payload.filter((g) => g.game.id === state.selectedGame.game.id)[0]
							: null
						: state.storedSelectedGame != null
						? action.payload.filter((g) => g.game.id === state.storedSelectedGame)[0]
						: action.payload.length > 0
						? action.payload[0]
						: null,
				selectedServer: state.selectedServer != null ? state.selectedServer : storedServers,
			};
		case 'SET_SELECTED_GAME':
			return {
				...state,
				selectedGame: action.payload,
				selectedServer:
					state.selectedGame != null
						? {
								...state.selectedServer,
								[state.selectedGame.game.id]:
									state.selectedServer[state.selectedGame.game.id] != null
										? state.selectedServer[state.selectedGame.game.id]
										: action.payload.servers.length > 0
										? action.payload.servers[0]
										: null,
						  }
						: null,
			};
		case 'SET_SELECTED_SERVER':
			return {
				...state,
				selectedServer:
					state.selectedGame != null
						? {
								...state.selectedServer,
								[state.selectedGame.game.id]: action.payload,
						  }
						: { ...state.selectedServer },
			};
		case 'NEWS_LOADING':
			return {
				...state,
				newsLoading: true,
			};
		case 'SET_NEWS':
			return {
				...state,
				newsLoading: false,
				newsPosts: action.payload,
			};
		default:
			return state;
	}
};
