import React, {useState, useEffect} from 'react';
import axios from 'axios'
import { Grommet, Heading, Box } from 'grommet';
import styles from '../styles/Home.module.css'

export default function MovieContainer() {

    const [title, setTitle] = useState('');
    const [src, setSrc] = useState('');
    const [state, setState] = useState('loading');

    async function getMovieData() {

        // Use axios to get our movie-data api
        await axios.get('http://localhost:3000/api/movie-data').then(function(response){
            setTitle(response.data.title);
            setSrc(response.data.src);
            console.log(response.data.src);
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
            <img src={src} width="230" height="345" />
        </Box>
        
    )

}