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
    const config = useSelector((state) => state.app.config);

    useEffect(() => {
        setLConfig(config);
    }, [config]);
    
    const [lConfig, setLConfig] = useState(config);
    const onChange = (e) => {
        setLConfig({
            ...lConfig,
            [e.target.name]: e.target.name === 'autoUpdate' ? e.target.checked : e.target.value,
        });
        ipcRenderer.invoke('updateAppConfig', e.target.name, e.target.name === 'autoUpdate' ? e.target.checked : e.target.value)
    }

    const checkUpdate = () => {
        toast.error('Launcher Updating Not Implemented Yet, Sorry 😢');
    }

	return (
		<Grid container spacing={2} className={classes.wrapper}>
            <Grid item xs={12} style={{textAlign: 'center'}}>
                <h3>Launcher Settings</h3>
            </Grid>
			<Grid item xs={12}>
				<div className={classes.configItem}>
					<TextField
						fullWidth
                        value={lConfig.downloadLocation}
                        name="downloadLocation"
						label="Download Path"
                        variant="outlined"
                        onClick={() => { ipcRenderer.invoke('selectDownloadDirectory'); }}
						helperText="This is where the launcher will keep the updated files, when you mod a game files are copied from this directory into your game install."
					/>
				</div>
			</Grid>
			<Grid item xs={6}>
				<div className={classes.configItem}>
					<TextField
						select
						fullWidth
						label="Play Behavior"
						value={lConfig.playBehavior}
                        name="playBehavior"
                        onChange={onChange}
						helperText="Determines how the launcher behaves after you click play"
						variant="outlined"
					>
						{PlayBehaviors.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</div>
			</Grid>
			<Grid item xs={6}>
				<div className={classes.configItem} style={{textAlign: 'center'}}>
                    <FormControlLabel
                        checked={lConfig.autoUpdate}
                        name="autoUpdate"
                        onChange={onChange}
                        control={<Switch color="primary" />}
                        label="Auto Update Launcher?"
                        labelPlacement="top"
                    />
				</div>
			</Grid>
			<Grid item xs={12}>
				<div className={classes.configItem} style={{textAlign: 'center'}}>
                    <Button color="primary" variant="outlined" fullWidth onClick={checkUpdate}>Check For Launcher Update</Button>
				</div>
			</Grid>
		</Grid>
	);
});
