import axios from 'axios'
import { readdirSync } from 'fs';

const cheerio = require('cheerio');

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
                numOfMovies = $('.js-list-entries').children().length;

            }).catch(e => console.log(e));
            
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
    
            }).catch(e => console.log(e));

            // Wait on the 'moviesOnLastPage' function (has to be in a try catch block to use await)
            // Then calculate how many total movies there are
            try{
                const numOfMovies = await moviesOnLastPage(95);
                totalMovies = (maxPage * 100) - (100 - numOfMovies);
            } catch(e){
                console.log(e);
            }
        
        return totalMovies;
    
    }

    async function getMovieDetails(movieNumber) {

        var title;
        var src = 'https://a.ltrbxd.com/resized/film-poster/'; // (4/6/5/6/4/9/465649-m3gan-0-230-0-345-crop.jpg)
        var id;
        var urlBuilder;

        // Calculate which page to start on, since we don't want to iterate through 95 pages of movies
        var startPage = Math.floor(movieNumber/100);

        // If the number of the movie isn't divisible by 100, then the movie is on the next page.
        if(movieNumber % 100 != 0) {
            startPage++;
        }

        // Create the url based on the necessary page number.
        urlBuilder = 'https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/page/' + startPage + '/';
        
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
                        id = $(children[i]).find('div').attr('data-film-id');

                    }
                
                }

                // Get the id, found in a div that contains the poster. They don't have the url to the poster in the source code,
                // so we'll have to build our own image url
                

                for(var i = 0; i < String(id).length; i++){
                    src += String(id)[i] + '/'
                }

                // Check to see if the title has a special character in the end of the movie title
                // I've noticed Letterboxd adds another dash in the img link if there is
                if(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(title[title.length-1])) {
                    src += String(id) + '-' + title.replace(/[^a-z\d\s]+/gi, '').replace(/\s/g, '-').toLowerCase() + '--0-230-0-345-crop.jpg';
                }
                else {
                    src += String(id) + '-' + title.replace(/[^a-z\d\s]+/gi, '').replace(/\s/g, '-').toLowerCase() + '-0-230-0-345-crop.jpg';
                }

            }) 
            .catch(function(err){
                console.log(err);
            }
        );

        const data = {
            "title": title,
            "src": src
        }

        return data;

    }

    return new Promise((resolve, reject) => {

        findTotalMovies().then(response => {
            //res.status(200).json({title: response});

            // Random number from 1 to the total number of movies
            let random = Math.floor(Math.random() * response) + 1;

            // Call the 'getMovieDetails' function and give it the random movie number
            getMovieDetails(random).then(detailsResponse => {
                //console.log(detailsResponse);
                // Set status to 200 (success) and return the title in json data
                res.status(200).json(detailsResponse);
                resolve();
            })

            
        }).catch(e => {
            console.log(e);
            res.status(405).end();
            resolve();
        });
    })

}