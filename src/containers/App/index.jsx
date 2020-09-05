import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import { ToastContainer } from 'react-toastify';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fad } from '@fortawesome/pro-duotone-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';

import Launcher from '../Launcher';
import Events from './Events';
import ReactRP from '../../assets/font/reactrp.ttf';

library.add(fad, fab);

const ReactRPFont = {
	fontFamily: 'ReactRP',
	fontStyle: 'normal',
	fontDisplay: 'swap',
	fontWeight: 400,
	src: `url(${ReactRP}) format('truetype')`,
};

export default connect()((props) => {
	const theme = useSelector((state) => state.app.mode);

	const muiTheme = createMuiTheme({
		typography: {
			fontFamily: 'Kanit,sans-serif',
		},
		palette: {
			primary: {
				main: '#00d8ff',
				light: '#00c0ff',
				dark: '#0093ae',
				contrastText: theme === 'dark' ? '#ffffff' : '#26292d',
			},
			secondary: {
				main: theme === 'dark' ? '#222222' : '#ffffff',
				light: theme === 'dark' ? '#2e2e2e' : '#F5F6F4',
				dark: theme === 'dark' ? '#191919' : '#EBEBEB',
				contrastText: theme === 'dark' ? '#ffffff' : '#2e2e2e',
			},
			error: {
				main: '#c75050',
				light: '#f77272',
				dark: '#802828',
			},
			success: {
				main: '#52984a',
				light: '#60eb50',
				dark: '#244a20',
			},
			warning: {
				main: '#f09348',
				light: '#f2b583',
				dark: '#b05d1a',
			},
			text: {
				main: theme === 'dark' ? '#f3f3f3' : '#2e2e2e',
				light: '#ffffff',
				dark: '#000000',
			},
			alt: {
				green: '#0ad3ac',
				greenDark: '#0e9c80',
			},
			border: {
				main: theme === 'dark' ? '#e0e0e008' : '#e0e0e008',
				light: '#ffffff',
				dark: '#26292d',
				input: theme === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
				divider: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
			},
			type: theme,
		},
		overrides: {
			MuiCssBaseline: {
				'@global': {
					'@font-face': [ReactRPFont],
					html: {
						overflow: 'hidden',
					},
				},
			},
		},
	});

	return (
		<MuiThemeProvider theme={muiTheme}>
			<CssBaseline />
			<Events />
			<Launcher />
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss={false}
				draggable
				pauseOnHover={false}
			/>
		</MuiThemeProvider>
	);
});
