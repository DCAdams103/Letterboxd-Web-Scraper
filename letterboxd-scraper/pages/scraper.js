import React, {Component, useEffect, useState} from 'react';
import axios from 'axios'

export default function Scraper() {

    const [title, setTitle] = useState('');
    const [src, setSrc] = useState('');
    const [state, setState] = useState('loading');

    async function getMovieData() {

        // Use axios to use our movie-data api
        await axios.get('https://letterboxd-web-scraper.vercel.app/api/movie-data').then(function(response){
            //const test = JSON.parse(response);
            setTitle(response.data.title);
            setSrc(response.data.src);
            setState('');
        }).catch(e => console.log(e));
    }

    // Call the getMovieData function 
    useEffect(() => {
        getMovieData();
    }, [])

    return <>

        <div>

            <p>{state}</p>
            <br />
            <p>{title}</p>

            <img src={src} width="230" height="345" />

        </div>

    </>

}