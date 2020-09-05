import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core';
import Particles from 'react-particles-js';

const useStyles = makeStyles((theme) => ({
	particles: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		margin: 'auto',
		zIndex: 0,
	},
}));

export default () => {
    const classes = useStyles();
    const theme = useTheme();

	return (
		<Particles
			className={classes.particles}
			params={{
				particles: {
					number: {
						value: 300,
						density: {
							enable: true,
							value_area: 2500,
						},
					},
					line_linked: {
						enable: true,
						opacity: 0.05,
						color: theme.palette.primary.main,
					},
					move: {
						speed: 1.25,
					},
					size: {
						value: 3,
						random: true,
					},
                    color: theme.palette.primary.main,
					opacity: {
						anim: {
							enable: true,
							speed: 1,
							opacity_min: 0.15,
						},
					},
				},
				interactivity: {
					events: {
						onclick: {
							enable: true,
							mode: 'push',
						},
					},
					modes: {
						push: {
							particles_nb: 1,
						},
					},
				},
			}}
		/>
	);
};
