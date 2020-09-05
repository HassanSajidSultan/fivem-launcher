export const initialState = {
    downloadPending: Object(),
	downloading: Object(),
    fileInProgress: Object(),
    filesFinished: Object(),
    downloadStats: Object(),
    
	copying: Object(),
    fileCopyInProgress: Object(),
    filesCopied: Object(),
	copyStats: Object(),
};

export default (state = initialState, action) => {
	switch (action.type) {
        case 'DOWNLOAD_REQUIRED':
            return {
                ...state,
                downloadPending: {
                    ...state.downloadPending,
                    [action.payload.game]: true,
                }
            }
		case 'DOWNLOAD_STARTING':
			console.log(action.payload);
			return {
				...state,
				downloadPending: Object.keys(state.downloadPending).reduce((result, key) => {
					if (key != action.payload.gameId) {
						result[key] = state.downloadPending[key];
					}
					return result;
				}, {}),
				downloading: {
					...state.downloading,
					[action.payload.gameId]: action.payload.type,
                },
				fileInProgress: Object.keys(state.fileInProgress).reduce((result, key) => {
					if (key != action.payload.gameId) {
						result[key] = state.fileInProgress[key];
					}
					return result;
				}, {}),
				downloadStats: Object.keys(state.downloadStats).reduce((result, key) => {
					if (key != action.payload.gameId) {
						result[key] = state.downloadStats[key];
					}
					return result;
				}, {}),
				filesFinished: Object.keys(state.filesFinished).reduce((result, key) => {
					if (key != action.payload.gameId) {
						result[key] = state.filesFinished[key];
					}
					return result;
				}, {}),
			};
		case 'INIT_DOWNLOAD_STATS':
			console.log(action.payload);
			return {
				...state,
				downloadStats: {
					...state.downloadStats,
					[action.payload.game]: {
						total: action.payload.total,
						count: action.payload.count,
						downloaded: 0,
					},
				},
			};
        case 'FINISH_FILE_DOWNLOAD':
            return {
                ...state,
				filesFinished: {
					...state.filesFinished,
					[action.payload.game]: state.filesFinished[action.payload.game] != null ? [ ...state.filesFinished[action.payload.game], action.payload.file ] : [ action.payload.file ],
				},
            };
		case 'DOWNLOAD_PROGRESS':
			return {
				...state,
				downloadStats: {
					...state.downloadStats,
					[action.payload.game]: {
						...state.downloadStats[action.payload.game],
						downloaded: action.payload.downloaded,
					},
				},
			};
		case 'DOWNLOAD_COMPLETE':
			return {
				...state,
				downloading: {
					...state.downloading,
					[action.payload.game]: false,
				},
				fileInProgress: Object.keys(state.fileInProgress).reduce((result, key) => {
					if (key != action.payload.game) {
						result[key] = state.fileInProgress[key];
					}
					return result;
				}, {}),
				downloadStats: Object.keys(state.downloadStats).reduce((result, key) => {
					if (key != action.payload.game) {
						result[key] = state.downloadStats[key];
					}
					return result;
				}, {}),
			};
		default:
			return state;
	}
};
