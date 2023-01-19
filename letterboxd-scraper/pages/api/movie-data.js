import axios from 'axios'
import React, {useState, useEffect} from 'react';

const cheerio = require('cheerio');
const imgSrcInvalid = "The image source url is invalid";

export default function handler(req, res){

    async function moviesOnLastPage(page){

        // Make the url based off the given page number
        const urlBuilder = 'https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/page/' + String(page) + '/'; 

        var numOfMovies;

        await axios.get(urlBuilder)
            .then(function(response) {

                // Give cheerio the source code
                const $ = cheerio.load(response.data);

                // Counts the number of children in the ul with class 'js-list-entries'
                var chil = $('.js-list-entries').children();
                numOfMovies = chil.length;
                
            }).catch(error => console.log(error));
            
        // wait for numOfMovies to have a value before returning its value
        return await numOfMovies;

    }

    async function findTotalMovies() {

        var totalMovies = 0;
        var maxPage = 0;
    
        await axios.get('https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/')
            .then(function(response) {

                // Give cheerio the source code
                const $ = cheerio.load(response.data);

                // Find the component on the bottom of the page that contains page numbers, and get it's children
                var children = $('.paginate-pages ul').children();
                
                // The number of how many page buttons there are
                var listLength = children.length;
                
                // The last page button contains the highest page number
                maxPage = parseInt($(children[listLength - 1]).find('a').text());
    
            }).catch(error => console.log(error));

            // Wait on the 'moviesOnLastPage' function (has to be in a try catch block to use await)
            // Then calculate how many total movies there are
            try{
                const numOfMovies = await moviesOnLastPage(95);
                totalMovies = (maxPage * 100) - (100 - numOfMovies);
            } catch(error){
                console.log(error);
            }
        
        return totalMovies;
    
    }

    async function getMovieDetails(movieNumber) {
        
        var title;

        // Create a copy of the title so we don't change the original
        var linkTitle;

        // They don't have the url to the poster in the source code,
        // so we'll have to build our own image url
        var src = 'https://a.ltrbxd.com/resized/film-poster/'; // (4/6/5/6/4/9/465649-m3gan-0-230-0-345-crop.jpg)

        // Calculate which page to start on, since we don't want to iterate through 95 pages of movies
        var startPage = Math.floor(movieNumber/100);

        // If the number of the movie isn't divisible by 100, then the movie is on the next page.
        if(movieNumber % 100 != 0) {
            startPage++;
        }

        // Create the url based on the necessary page number.
        const urlBuilder = 'https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/page/' + startPage + '/';
        
        await axios.get(urlBuilder)
            .then(function(response) {

                // Give cheerio the source code
                const $ = cheerio.load(response.data);

                // Get the children of the ul with the 'js-list-entries' class
                var children = $('.js-list-entries').children();

                // For every child, we check it's number to see if it matches
                for(var i = 0; i < children.length; i++) {
                    
                    if($(children[i]).text().trim() == movieNumber) {

                        // Get the title of the movie by grabbing it from the alt attribute in the image
                        title = $(children[i]).find('img').attr('alt');

                        // Get the id found in a div with an attribute "data-film-id". 
                        var id = $(children[i]).find('div').attr('data-film-id');

                    }
                
                }
                
                // Create copy of the title to modify
                linkTitle = title;

                // Letterboxd urls include the movie id with slashes after each number (ex: 1/2/3/4/5/ )
                for(var i = 0; i < String(id).length; i++){
                    src += String(id)[i] + '/'
                }

                // Letterboxd has a character limit for their titles in their image sources (it's 59 characters)
                if(title.length > 59) {
                    linkTitle = title.substring(0, 59);
                }

                // Check to see if the title has a special character in the end of the movie title
                // I've noticed Letterboxd adds another dash in the img link if there is
                if(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(title[title.length-1])) {

                    // RegEx breakdown: First remove any existing dashes (-) and it's leading space, or any colons,
                    // remove any special characters(except dash), replace spaces with dashes,
                    // Lastly, we make everything lowercase.
                    linkTitle = linkTitle.replace(/[-](\s)|[:]/gi, '').replace(/[^a-zA-Z0-9-]/g, ' ').replace(/\s/g, '-').toLowerCase();
                    src += String(id) + '-' + linkTitle + '--0-230-0-345-crop.jpg';

                }
                else {

                    linkTitle = linkTitle.replace(/[-][\s]|[:]/gi, '').replace(/[^a-zA-Z0-9-]/g, ' ').replace(/\s|[']/g, '-').toLowerCase()
                    src += String(id) + '-' + linkTitle + '-0-230-0-345-crop.jpg';

                }

            }) 
            .catch(function(error){
                console.log(error);
            }
        );
        
        // Test the image source link to see if it works.
        await axios.get(src)
            .then(function(response){
                
            })
            .catch(function(error){
                
                // Put together data we'll need
                const throwData = {
                    "message": imgSrcInvalid,
                    "data": linkTitle,
                    "title": title,
                }

                // Throw an error, then when it's caught, we'll use the TMDb API to fetch the movie poster  
                throw throwData;

            });

        //Put our data into a JSON object
        const data = {
            "title": title,
            "src": src
        }

        return data;

    }

    async function scrapeTMDbId(linkTitle) {

        var TMDbId;

        await axios.get("https://letterboxd.com/film/" + linkTitle + '/')
            .then(function(response){

                // Load cheerio
                const $ = cheerio.load(response.data);

                // Find link attributes
                var children = $('.text-link').find('a');
                
                // For every child, we check it's number to see if it matches
                for(var i = 0; i < children.length; i++) {

                    // Get the url that contains the movie id that TMDb uses
                    if($(children[i]).attr('data-track-action') == "TMDb"){
                        TMDbId = $(children[i]).attr('href');
                    }

                }

                // Get the id out of the url by removing all the characters that aren't numbers
                TMDbId = TMDbId.replace(/[^0-9]/gi, '');

            })
            .catch(function(error){
                console.log(error);
            });
        
        // Return the TMDbId
        return TMDbId;

    }

    async function retrieveMoviePoster(TMDbId){

        var src;

        await axios.get("https://api.themoviedb.org/3/movie/" + TMDbId + "?api_key=d9b284a754e7790dd5b7cca3fa4b8c88&language=en-US")
            .then(function(response){
                src = response.data.poster_path;
                
            })
            .catch(function(error){
                console.log(error);
            });

        return src;
    }

    return new Promise((resolve, reject) => {

        findTotalMovies().then(response => {

            // Random number from 1 to the total number of movies
            let random = Math.floor(Math.random() * response) + 1;

            // Call the 'getMovieDetails' function and give it the random movie number
            getMovieDetails(random).then(detailsResponse => {
                
                // Set status to 200 (success) and return the title in json data
                //console.log('deets ' + detailsResponse);
                res.status(200).json(detailsResponse);
                resolve();

            }).catch(function(error){

                // If the image url is incorrect
                if(error.message == imgSrcInvalid){

                    // We need to source the image from TMDb instead, since the letterboxd url didn't work
                    // First we scrape the letterboxd source code once again to find which movie id it uses for TMDb
                    scrapeTMDbId(error.data).then(response => {
                        console.log(" OOOO " + response);
                        // Retrieve the movie poster with the TMDb movie Id and return the movie title and the new image source link
                        retrieveMoviePoster(response)
                            .then(details => {
                                const data = {
                                    "title": error.title,
                                    "src": "https://www.themoviedb.org/t/p/original" + details,
                                }

                                res.status(200).json(data);
                                resolve();
                            })
                            .catch(function(error){
                                console.log(error);
                            });
                    });
                    
                }

            })

            
        }).catch(e => {

            console.log(e);
            res.status(405).end();
            resolve();

        });
    })

}