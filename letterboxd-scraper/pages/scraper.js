import React, {Component, useEffect, useState} from 'react';
import axios from 'axios'

const cheerio = require('cheerio');

async function findTotalMovies() {

    var maxPage = 0;
    var listLength = 0;
    var totalMovies = 0;

    await axios.get('https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/', {crossdomain: true})
        .then(function(response) {
            const $ = cheerio.load(response.data);
            var children = $('.paginate-pages ul').children();

            listLength = $('.paginate-pages ul').children().length;
            
            maxPage = parseInt($(children[4]).find('a').text());

            totalMovies = (maxPage * 100) - (100 - listLength);

        })
        .catch(function(err){
            console.log(err);
        }
    );

    return await totalMovies;

}

async function getMovieDetails(id) {

    var title;
    var urlBuilder;
    var startPage = Math.floor(id/100);

    if(id % 100 != 0) {
        startPage++;
    }

    urlBuilder = 'https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/page/' + startPage + '/';
    console.log(urlBuilder);
    await axios.get(urlBuilder, {crossdomain: true})
        .then(function(response) {
            const $ = cheerio.load(response.data);
            var children = $('.js-list-entries').children();
            for(var i = 0; i < children.length; i++) {
                //console.log($(children[i]).text().trim());
                if($(children[i]).text().trim() == id) {
                    title = $(children[i]).find('img').attr('alt');
                }
            }

        }) 
        .catch(function(err){
            console.log(err);
        }
    );

    return title;

}

export default function Scraper() {

    const [title, setTitle] = useState('');
    const [state, setState] = useState('');
    const [count, setCount] = useState(0);

    async function loadData() {

        const res = new Promise((resolve, reject) => {
                findTotalMovies().then((totalMovies) => {
                var rand = Math.floor(Math.random() * parseInt(totalMovies)) + 1;
                console.log('rand: ' + rand);
                getMovieDetails(rand).then((title) => {
                    resolve(title);
                }).catch(e => console.log(e));
            });
        });

        return await res;

    }

    useEffect(() => {
        loadData().then((res) => {
            console.log('res ' + res);
            if(String(res) != "undefined") { setTitle(String(res) + " a"); }
            setState('loading');
            setCount(count + 1);
            
        });
     }, []);
    

    let test2;
    
    async function bruh(res){
        const res2 = new Promise((resolve, reject) => {
            test2 = res;
            if(test2 != undefined){
                resolve(test2);
            }
        });

        return await res2;
    }

    

    return <>

        <div>

            test
            <br />
            {count}
            <br />
            {state}
            <br />
            <p>{title}</p>

        </div>

    </>

}

// class Scraper extends Component {
    
//     state = {};

//     constructor(props) {
//         super(props);
//         this.state = {data: "a"}
        
//     }

//     componentDidMount() {

//         this.loadData().then(res => this.setState({data: res}, function() {
//             console.log("OMG");
//         }));

//     }

//     async loadData() {

//         const res = new Promise((resolve, reject) => {
//                 findTotalMovies().then((totalMovies) => {
//                 var rand = Math.floor(Math.random() * parseInt(totalMovies)) + 1;
//                 console.log('rand: ' + rand);
//                 getMovieDetails(rand).then((title) => {
//                     resolve(title);
//                 });
//             });
//         });
        
//         return await res;

//     }

//     render() {

//         if(this.state.data == null) {
//             return <div><p>loading</p></div>
//         }

//         return (
//             <div>
//                 test
//                 <br />
//                 {this.state.data}
//             </div>
//         )
//     }

// }

// export default Scraper;