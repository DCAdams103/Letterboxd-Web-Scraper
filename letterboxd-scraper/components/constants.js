/*

------------- Determine if we're in production or development mode and change the API_URL accordingly. ------------- 

*/


const prod = {
    url: {
        API_URL: "https://letterboxd-web-scraper.vercel.app/api/movie-data",
    }
}

const dev = {
    url: {
        API_URL: "http://localhost:3000/api/movie-data",
    }
}

export const config = process.env.NODE_ENV === 'devlopment' ? prod : dev;