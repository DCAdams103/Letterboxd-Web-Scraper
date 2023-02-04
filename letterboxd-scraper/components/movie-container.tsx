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
    const [rating, setRating] = useState(0);

    async function getMovieData() {
        // Use axios to get our movie-data api
        await axios.get(url).then(function(response){
            setTitle(response.data.title);
            setSrc(response.data.src);
            setRating(response.data.rating);
            setState('');
            document.documentElement.style.setProperty('--shadow-color', response.data.shadowColor);

            
        }).catch(e => console.log(e));
    }

    // Call the getMovieData function 
    useEffect(() => {
        getMovieData();
    }, [])

    //const img = document.getElementById('poster');

    useEffect(() => {
        const img = new Image(230, 345);
        img.src = src;
        // //test(img.src);
        
        
    }, [src]);
    
    return (
        <Box className={styles.movie}>
            <Heading> {title} </Heading>
            <br /><br />
            <img className={styles.poster} id='poster' src={src} width="230" height="345" />
            {rating}

        </Box>
        
    )

}