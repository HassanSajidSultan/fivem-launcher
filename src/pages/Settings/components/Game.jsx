import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid, TextField, MenuItem, ButtonGroup, Button, FormControl, FormGroup, FormControlLabel, Switch } from '@material-ui/core';
import { toast } from 'react-toastify';

const { ipcRenderer } = window.require('electron');

const PlayBehaviors = [
	{
		value: 'nothing',
		label: 'Leave Open',
	},
	{
		value: 'minimize',
		label: 'Minimize Launcher',
	},
	{
		value: 'close',
		label: 'Close Launcher',
	},
];

const useStyles = makeStyles((theme) => ({
	wrapper: {
		width: '100%',
		height: 'fit-content',
		marginTop: 10,
		textAlign: 'left',
	},
	configItem: {
		background: `${theme.palette.text.light}14`,
		border: `1px solid ${theme.palette.text.dark}2e`,
		backdropFilter: 'blur(8px)',
		padding: '2vh',
	},
}));

export default connect()((props) => {
	const classes = useStyles();
    const config = useSelector((state) => state.app.config.games[props.game.id]);

    useEffect(() => {
        setLConfig(config);
    }, [config]);
    
    const [lConfig, setLConfig] = useState(config);
    const onChange = (e) => {
        ipcRenderer.invoke('updateGameConfig', props.game.id, e.target.name, e.target.name === 'autoUpdate' ? e.target.checked : e.target.value)
    }

    const checkUpdate = () => {
        toast.error('Game File Updating Not Implemented Yet, Sorry 😢');
    }

	return (
		<Grid container spacing={2} className={classes.wrapper}>
            <Grid item xs={12} style={{textAlign: 'center'}}>
                <h3>{props.game.name} Settings</h3>
            </Grid>
			<Grid item xs={8}>
				<div className={classes.configItem}>
					<TextField
						fullWidth
                        value={lConfig.gameLocation != null ? lConfig.gameLocation : ''}
                        name="selectGameDir"
						label={`${props.game.short} Install Location`}
                        variant="outlined"
                        onClick={() => { ipcRenderer.invoke('selectGameDir', props.game); }}
						helperText={`Install location for ${props.game.name}, This location must have ${props.game.launcher.requiredFile} in the selected folder location.`}
					/>
				</div>
			</Grid>
			<Grid item xs={4}>
				<div className={classes.configItem} style={{textAlign: 'center'}}>
                    <FormControlLabel
                        checked={lConfig.gameLocation != null ? lConfig.autoUpdate : false}
                        name="autoUpdate"
                        onChange={onChange}
                        disabled={lConfig.gameLocation == null}
                        control={<Switch color="primary" />}
                        label="Auto Update Game Files?"
                        labelPlacement="top"
                    />
				</div>
			</Grid>
			<Grid item xs={12}>
				<div className={classes.configItem} style={{textAlign: 'center'}}>
                    <Button color="primary" variant="outlined" fullWidth onClick={checkUpdate}>Check For Game Files Update</Button>
				</div>
			</Grid>
		</Grid>
	);
});
