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
    const [movieURL, setMovieURL] = useState('');
    const [stars, setStars] = useState('');
    const [half, setHalf] = useState(false);

    async function getMovieData() {
        // Use axios to get our movie-data api
        await axios.get(url).then(function(response){
            setTitle(response.data.title);
            setSrc(response.data.src);
            setRating(response.data.rating);
            setMovieURL(response.data.url);
            setState('');
            document.documentElement.style.setProperty('--shadow-color', response.data.shadowColor);
            
        }).catch(e => console.log(e));
    }

    function roundRating() {

        var starText = "";

        for(var i = 0; i < rating - (rating % 1); i++) {
            starText += "★";
        }

        if(rating % 1 >= 0.5) {
            setHalf(true);
        } else {
            setHalf(false);
        }
        
        setStars(starText);

    }

    // Call the getMovieData function 
    useEffect(() => {
        getMovieData();
    }, [])

    useEffect(() => { 
        roundRating();
    }, [rating]);
    
    return (
        <Box className={styles.movie}>
            <Heading className={styles.title}> {title} </Heading>
            <a className={styles.link} href={movieURL} target="_blank">
                <img id='letterboxd' src='lb-icon.png' width='50' height='50' />
                <h3>View on Letterboxd</h3>
            </a>

            <div className={styles.rating}>
                <p className={styles.stars}>{stars}</p>
                {half && <h3>&frac12;</h3> }
            </div>
            
            {rating}
            <br />
            <br />
            <img className={styles.poster} id='poster' src={src} width="230" height="345" />
            

        </Box>
        
    )

}