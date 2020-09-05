import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';

import Loader from '../../components/Loader';
import Post from './Post';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
	wrapper: {
		width: '100%',
		height: 'calc(100vh - 100px)',
		textAlign: 'center',
		fontSize: 25,
		fontFamily: 'ReactRP',
		textShadow: `0 0 5px ${theme.palette.secondary.dark}`,
	},
	header: {
		padding: '0 2vh',
		textAlign: 'left',
		height: '10vh',
		lineHeight: '10vh',
	},
	count: {
		color: theme.palette.primary.main,
	},
	newsWrapper: {
		height: 'calc(90vh - 100px)',
		overflowY: 'auto',
		overflowX: 'hidden',
		'&::-webkit-scrollbar': {
			width: 4,
		},
		'&::-webkit-scrollbar-track': {
			background: 'transparent',
		},
		'&::-webkit-scrollbar-thumb': {
			background: `${theme.palette.text.main}5e`,
		},
	},
	pagination: {
		padding: 10,
		textShadow: `0 0 5px ${theme.palette.secondary.dark}`,
		background: `${theme.palette.text.dark}3b`,
		border: `1px solid ${theme.palette.text.dark}5e`,
		backdropFilter: 'blur(8px)',
	},
}));

const resetScrollEffect = ({ element }) => {
    if (element.current == null) return;
    element.current.scrollTop = 0;
}

export default connect()((props) => {
	const classes = useStyles();
	const loading = useSelector((state) => state.app.newsLoading);
	const newsPosts = useSelector((state) => state.app.newsPosts);

    const elRef = useRef(null)
    useEffect(() => resetScrollEffect({ element: elRef }), [newsPosts])

	const handleChange = (_, value) => {
		ipcRenderer.invoke('getNews', false, value);
	};

	return (
		<div className={classes.wrapper}>
			{loading || newsPosts == null ? (
				<Loader text="Loading News" size={75} />
			) : (
				<div>
					<Grid container className={classes.header}>
						<Grid item xs={6}>
							Community News
						</Grid>
						<Grid item xs={6} style={{ textAlign: 'right' }}>
							<span className={classes.count}>{newsPosts.total}</span> Posts
						</Grid>
					</Grid>
                    <div className={classes.newsWrapper} ref={elRef}>
                        {newsPosts.posts.map((post, i) => {
                            return <Post key={`news-${i}`} post={post} />;
                        })}
                        <div className={classes.pagination}>
                            <Pagination
                                color="primary"
                                variant="outlined"
								shape="rounded"
								defaultPage={1}
								boundaryCount={2}
                                count={newsPosts.pages}
                                page={newsPosts.page}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
				</div>
			)}
		</div>
	);
});
