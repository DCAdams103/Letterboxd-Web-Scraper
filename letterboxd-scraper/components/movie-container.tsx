import React, {useState, useEffect} from 'react';
import Image from 'next/image'
import axios from 'axios'
import { Grommet, Heading, Box, Button } from 'grommet';
import styles from '../styles/Home.module.css'
import {config} from './constants';

export default function MovieContainer() {

    var url = config.url.API_URL;
    
    const [refresh, setRefresh] = useState(false);
    const [disable, setDisable] = useState(false);
    const [title, setTitle] = useState('');
    const [src, setSrc] = useState('');
    const [state, setState] = useState('loading');
    const [rating, setRating] = useState(0);
    const [movieURL, setMovieURL] = useState('');
    const [stars, setStars] = useState('');
    const [half, setHalf] = useState(false);
    const [roundedRating, setRoundedRating] = useState('');

    // Grommet Theme
    const myTheme = {
        global: {
            active: {
                background: {
                    color: {dark: "rgb(0, 192, 48)", light: "rgb(0, 192, 48)"},
                    opacity: 1,
                },
                color: {dark: "black", light: "black"},
                
            },
            
        },
        
    };

    // Call the getMovieData function 
    useEffect(() => {
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

        getMovieData().catch(error => console.log("getMovieData error " + error))

    }, [url, refresh])


    // Create stars text and make rounded rating text
    useEffect(() => { 
        
        var starText = "";
        var rounded = Math.round(rating * 10) / 10;

        for(var i = 0; i < rounded - (rounded % 1); i++) {
            starText += "★";
        }

        if(rounded % 1 >= 0.5) {
            setHalf(true);
        } else {
            setHalf(false);
        }

        setStars(starText);
        setRoundedRating(rounded.toFixed(1));
        setDisable(false);

    }, [rating]);

    // Used to find a new movie 
    function refreshComponent() {
        setRefresh(!refresh);
        setDisable(true);
        setState('loading');
    }
    
    return (
        
        <Box className={styles.movie}>
            {state != 'loading' ? 
                <>
                    <Heading className={styles.title}> {title} </Heading>

                    {/* View on letterboxd link */}
                    <a className={styles.link} href={movieURL} target="_blank" rel="noreferrer">
                        <Box direction='row' className={styles.link}>
                            <Image alt='letterboxd' id='letterboxd' src='/lb-icon.png' width='50' height='50' />
                            <h3>View on Letterboxd</h3>
                        </Box>
                    </a>

                    <Box direction='row' className={styles.rating}>

                        {/* If the rating equals -1, the rating was not successfully retrieved (It most likely does not have a rating) */}
                        {rating != -1 ? 
                        <>
                            <h2>{roundedRating}</h2>
                            <p className={styles.stars}>{stars}</p>
                            {half && <h3>&frac12;</h3> }
                        </> 
                        : 
                        <h2>N/A</h2>}
                        
                    </Box>
                    
                    <br />
                    <br />
                    
                    {/* Film poster */}
                    <Image className={styles.poster} alt={title} id='poster' src={src} width="230" height="345" priority />
                    
                    <br />
                    <br />

                    {/* Pick another film button */}
                    <Grommet theme={myTheme}>
                        <Button primary active onClick={refreshComponent} disabled={disable} label="Pick another film" color={"none"}/>
                    </Grommet>
                </>
                :
                <h1>Loading...</h1>
            }

        </Box>
        
    )

}