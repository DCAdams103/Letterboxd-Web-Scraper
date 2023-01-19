import React, {useState, useEffect} from 'react';
import axios from 'axios'
import { Grommet, Heading, Box } from 'grommet';
import styles from '../styles/Home.module.css'
import {config} from './constants';

export default function MovieContainer() {

    var url = config.url.API_URL;

    const [title, setTitle] = useState('');
    const [src, setSrc] = useState('');
    const [state, setState] = useState('loading');

    async function getMovieData() {
        // Use axios to get our movie-data api
        await axios.get(url).then(function(response){

            setTitle(response.data.title);
            setSrc(response.data.src);
            setState('');
            
        }).catch(e => console.log(e));
    }

    // Call the getMovieData function 
    useEffect(() => {
        getMovieData();
    }, [])

    return (
        <Box className={styles.movie}>
            <Heading> {title} </Heading>
            <br /><br />
            <img id='poster' src={src} width="230" height="345" />
        </Box>
        
    )

}