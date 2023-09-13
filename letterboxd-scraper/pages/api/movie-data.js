import axios from 'axios'
import { getAverageColor } from 'fast-average-color-node';

const cheerio = require('cheerio');
const imgSrcInvalid = "The image source url is invalid";
const baseURL = "https://letterboxd.com/film/"

export default function handler(req, res){

    // Find the number of movies on the last page, and later use that to calculate the total movies in the list
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
                
            }).catch(error => console.log("moviesOnLastPage error " + error + "\n"));
            
        // wait for numOfMovies to have a value before returning its value
        return await numOfMovies;

    }

    // find the total amount of movies in the list
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
    
            }).catch(error => console.log(error + "\n"));

            // Wait on the 'moviesOnLastPage' function (has to be in a try catch block to use await)
            // Then calculate how many total movies there are
            try{
                const numOfMovies = await moviesOnLastPage(95);
                totalMovies = (maxPage * 100) - (100 - numOfMovies);
            } catch(error){
                console.log("findTotalMovies " + error + "\n");
            }
        
        return totalMovies;
    
    }

    // Get the averge color that's present in the movie poster
    async function returnAverageColor(src) {

        const color = await getAverageColor(src).catch(e => { console.log(e + "\n") });
        return color.rgb;

    };

    // This function gets the title, id, link title, 
    async function getMovieDetails(movieNumber) {

        var title;
        var rating;
        // Create a copy of the title so we don't change the original
        var linkTitle;

        var imgLinkTitle;

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

                        linkTitle = $(children[i]).find('div').attr("data-film-slug");
                        
                    }
                
                }
                
                // Create copy of the title to modify
                imgLinkTitle = linkTitle;

                // Letterboxd urls include the movie id with slashes after each number (ex: 1/2/3/4/5/ )
                for(var i = 0; i < String(id).length; i++){
                    src += String(id)[i] + '/'
                }

                // Remove the beginning and end slashes
                imgLinkTitle = imgLinkTitle.substring(1, imgLinkTitle.length-1);
                imgLinkTitle = imgLinkTitle.substring(0, imgLinkTitle.length);

                // // Letterboxd has a character limit for their titles in their image sources (it's 59 characters)
                if(title.length > 59) {
                    imgLinkTitle = title.substring(0, 59);
                }
                
                // // Check to see if the title has a special character in the end of the movie title
                // // I've noticed Letterboxd adds another dash in the img link if there is
                if(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(title[title.length-1])) {

                    src += String(id) + '-' + imgLinkTitle.replace(/^(?:[^\/]*\/)+/gi, '') + '--0-230-0-345-crop.jpg';

                }
                else {

                    src += String(id) + '-' + imgLinkTitle.replace(/^(?:[^\/]*\/)+/gi, '') + '-0-230-0-345-crop.jpg';

                }

            }) 
            .catch(function(error){
                console.log("getMovieDetails error " + error + "\n");
            }
        );
        
        // Get the rating
        rating = await scrapeMovieRating(linkTitle);
        
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
                    "linkTitle": linkTitle,
                    "rating": rating,
                }

                

                // Throw an error, then when it's caught, we'll use the TMDb API to fetch the movie poster  
                throw throwData;

            });

        //Put our data into a JSON object
        const data = {
            "title": title,
            "src": src,
            "url": baseURL + linkTitle,
            "shadowColor": await returnAverageColor(src),
            "rating": await scrapeMovieRating(linkTitle),
        }

        return data;

    }

    // Find the rating in the movie page
    async function scrapeMovieRating(linkTitle){

        var rating;

        await axios.get(baseURL + linkTitle)
            .then(function(response){

                // Load cheerio
                const $ = cheerio.load(response.data);

                // Find how many stars this film has been rated
                try{
                    rating = $('meta[name="twitter:data2"]').attr('content').substring(0, 4);
                } catch {
                    rating = -1;
                }
                

            })
            .catch(function(error){
                console.log("scrapeMovieRating error" + error + "\n");
                
            });
        
        // Return the star rating
        return rating;
    }

    // Find the TMDbId if the movie poster is not found
    async function scrapeTMDbId(linkTitle) {

        var TMDbId;

        await axios.get(baseURL + linkTitle)
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
                console.log("scrapeTMDbId Error " + error + "\n");
            });
        
        // Return the TMDbId
        return TMDbId;

    }

    // Get the movie poster from themoviddb.org
    async function retrieveMoviePoster(TMDbId){

        var src;

        await axios.get("https://api.themoviedb.org/3/movie/" + TMDbId + "?api_key=d9b284a754e7790dd5b7cca3fa4b8c88&language=en-US")
            .then(function(response){
                src = response.data.poster_path;
            })
            .catch(function(error){
                console.log("Error in retrieveMoviePoster " + error + "\n");
            });

            const data = {
                "src": "https://www.themoviedb.org/t/p/original" + src,
                "shadowColor": await returnAverageColor("https://www.themoviedb.org/t/p/original" + src),
            }
            
        return data;
    }

    return new Promise((resolve, reject) => {

        // Start the chain of calls 
        findTotalMovies().then(response => {

            // Random number from 1 to the total number of movies
            let random = Math.floor(Math.random() * response) + 1;

            // Call the 'getMovieDetails' function and give it the random movie number
            getMovieDetails(random).then(detailsResponse => {
                
                // Set status to 200 (success) and return the title in json data
                res.status(200).json(detailsResponse);
                resolve();

            }).catch(function(error){
                console.log("getMovieDetails catch: " + error.message + "\n");
                // If the image url is incorrect
                if(error.message == imgSrcInvalid){

                    // We need to source the image from TMDb instead, since the letterboxd url didn't work
                    // First we scrape the letterboxd source code once again to find which movie id it uses for TMDb
                    scrapeTMDbId(error.data).then(response => {

                        // Retrieve the movie poster with the TMDb movie Id and return the movie title and the new image source link
                        retrieveMoviePoster(response)
                            .then(details => {
                                const data = {
                                    "title": error.title,
                                    "rating": error.rating,
                                    "url": baseURL + error.linkTitle,
                                    "src": details.src,
                                    "shadowColor": details.shadowColor,
                                }

                                res.status(200).json(data);
                                resolve();
                            })
                            .catch(function(error){
                                console.log("getMovieDetails catch" + error + "\n");
                            });
                    });
                    
                }

            })

        }).catch(e => {

            console.log(e + "\n");
            res.status(405).end();
            resolve();

        });
    })

}