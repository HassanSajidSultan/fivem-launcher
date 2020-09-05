import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, IconButton } from '@material-ui/core';
import Moment from 'react-moment';
import Truncate from 'react-truncate';
import { Sanitize } from '../../utils/Parser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const { shell, ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
	wrapper: {
		height: 'fit-content',
        fontFamily: 'Kanit,sans-serif',
		textAlign: 'left',
		textShadow: `0 0 5px ${theme.palette.secondary.dark}`,
        background: `${theme.palette.text.dark}3b`,
        border: `1px solid ${theme.palette.text.dark}5e`,
		backdropFilter: 'blur(8px)',
		marginBottom: '2vh',
		padding: '1vh',
        position: 'relative',
	},
	title: {
        display: 'block',
		fontSize: 24,
        padding: '1vh',
        borderBottom: `1px solid ${theme.palette.text.light}5e`,
        color: theme.palette.primary.main,
        '&:hover': {
            cursor: 'pointer',
            transition: 'color ease-in 0.15s',
            color: theme.palette.primary.dark,
        }
	},
    viewLink: {
        position: 'absolute',
        right: '0.5%',
        top: '2%',
        fontSize: 20,
		color: theme.palette.primary.main,
    },
	content: {
		fontSize: 14,
		padding: '1vh',
		maxHeight: '10vh',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
	},
	byLine: {
		fontSize: 14,
        marginTop: 5,
	},
	author: {
		color: theme.palette.primary.main,
        '&:hover': {
            cursor: 'pointer',
            transition: 'color ease-in 0.15s',
            color: theme.palette.primary.dark,
        },
        '&::before': {
            color: theme.palette.text.main,
            content: '"By"',
            marginRight: 5,
        }
	},
    time: {
		color: theme.palette.alt.green,
        '&::before': {
            color: theme.palette.text.main,
            content: '"On"',
            marginLeft: 5,
            marginRight: 5,
        }
    },
    category: {
        color: theme.palette.primary.main,
        '&:hover': {
            cursor: 'pointer',
            transition: 'color ease-in 0.15s',
            color: theme.palette.primary.dark,
        },
        '&::before': {
            color: theme.palette.text.main,
            content: '"In"',
            marginLeft: 5,
            marginRight: 5,
        }
    }
}));

export default connect()((props) => {
    const classes = useStyles();

	return (
		<div className={classes.wrapper}>
			<a className={classes.title} href={props.post.url} target='_blank'>
				{props.post.prefix != null ? <span className={classes.prefix}>{props.post.prefix}</span> : null}
				{props.post.title}
			</a>
            <IconButton className={classes.viewLink} href={props.post.url} target='_blank'>
                <FontAwesomeIcon icon={['fad', 'external-link-square']} />
            </IconButton>
			<div className={classes.content}>
                <Truncate lines={2} ellipsis={<span>...</span>}>
                    {Sanitize(props.post.firstPost.content)}
                </Truncate>
			</div>
			<div className={classes.byLine}>
				<a className={classes.author} href={props.post.firstPost.author.profileUrl} target='_blank'>{props.post.firstPost.author.name}</a>
				<span className={classes.time}>
					<Moment date={new Date(props.post.firstPost.date)} format="dddd, MMMM Do YYYY" />
				</span> 
                <a className={classes.category} href={props.post.forum.url} target='_blank'>
                    {props.post.forum.path}
                </a>
			</div>
		</div>
	);
});
