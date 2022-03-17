//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');
const { type } = require('express/lib/response');

const app = express();

const apiVersion = '/api/v1';

//Port environment variable already set up to run on Heroku
let port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

//Set Cors-related headers to prevent blocking of local requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//The following is an example of an array of two tunes.  Compared to assignment 2, I have shortened the content to make it readable
var tunes = [
    { id: '0', name: "Für Elise", genreId: '1', content: [{note: "E5", duration: "8n", timing: 0},{ note: "D#5", duration: "8n", timing: 0.25},{ note: "E5", duration: "8n", timing: 0.5},{ note: "D#5", duration: "8n", timing: 0.75},
    { note: "E5", duration: "8n", timing: 1}, { note: "B4", duration: "8n", timing: 1.25}, { note: "D5", duration: "8n", timing: 1.5}, { note: "C5", duration: "8n", timing: 1.75},
    { note: "A4", duration: "4n", timing: 2}] },

    { id: '3', name: "Seven Nation Army", genreId: '0', 
    content: [{note: "E5", duration: "4n", timing: 0}, {note: "E5", duration: "8n", timing: 0.5}, {note: "G5", duration: "4n", timing: 0.75}, {note: "E5", duration: "8n", timing: 1.25}, {note: "E5", duration: "8n", timing: 1.75}, {note: "G5", duration: "4n", timing: 1.75}, {note: "F#5", duration: "4n", timing: 2.25}] },
    
    { id: '4', name: "Für Elise2", genreId: '3', content: [{note: "E5", duration: "8n", timing: 0},{ note: "D#5", duration: "8n", timing: 0.25},{ note: "E5", duration: "8n", timing: 0.5},{ note: "D#5", duration: "8n", timing: 0.75},
    { note: "E5", duration: "8n", timing: 1}, { note: "B4", duration: "8n", timing: 1.25}, { note: "D5", duration: "8n", timing: 1.5}, { note: "C5", duration: "8n", timing: 1.75},
    { note: "A4", duration: "4n", timing: 2}] },

    { id: '5', name: "Seven Nation Army2", genreId: '5', 
    content: [{note: "E5", duration: "4n", timing: 0}, {note: "E5", duration: "8n", timing: 0.5}, {note: "G5", duration: "4n", timing: 0.75}, {note: "E5", duration: "8n", timing: 1.25}, {note: "E5", duration: "8n", timing: 1.75}, {note: "G5", duration: "4n", timing: 1.75}, {note: "F#5", duration: "4n", timing: 2.25}] }
];

let genres = [
    { id: '0', genreName: "Rock"},
    { id: '1', genreName: "Classic"},
    { id: '2', genreName: "Pop"},
    { id: '3', genreName: "Rap"},
    { id: '4', genreName: "EDM"},
    { id: '5', genreName: "Prog"}
];
let nextTuneId = 4;
let nextGenreId = 6;

//Your endpoints go here

app.get(apiVersion + '/genres', (req,res) => {
    
    res.status(200).json(genres);
})
app.get(apiVersion + '/tunes/:genreName?', (req,res) => {
    
    let retArray = [];
    if (req.query.genreName === undefined) {
    for (let i=0;i<tunes.length;i++) {
        retArray.push({id:tunes[i].id, name: tunes[i].name, genreId: tunes[i].genreId});
    }     
} else {
    let genreId = -1;
    for (let j=0;j<genres.length;j++) {
        if (genres[j].genreName.toUpperCase() === req.query.genreName.toUpperCase()) {
            genreId = genres[j].id;
        }
    }
    for (let k=0;k<tunes.length;k++) {
        if(tunes[k].genreId=== genreId) {
            retArray.push({id:tunes[k].id, name: tunes[k].name, genreId: tunes[k].genreId});
        }
    }    
}
res.status(200).json(retArray);


})

app.get(apiVersion + '/genres/:genreId/tunes/:id', (req,res) => {

    for (tune in tunes) {
        if (req.params.id == tunes[tune].id) {
        res.status(200).json(tunes[tune]);
        }
    }
    res.status(404).json({ 'message': "Tune with id " + req.params.id + " does not exist." });
    
})

function contentCheck(content) {
    if (content[0] === undefined) {
        return false;
    }
    for(let i=0;i< content.length;i++) {
        if (content[i].note === undefined || content[i].timing === undefined || content[i].duration === undefined) {
            return false;
        }
    }
    return true;
}

app.post(apiVersion + '/genres/:genreId/tunes', (req, res) => {
    
    if (req.params !== undefined) {
        for(let i=0;i<genres.length;i++) {
            if (req.params.genreId === genres[i].id) {
                if(req.body === undefined || req.body.name === undefined || req.body.content === undefined) {
                    res.status(400).json({ 'message': "Tunes require a name and content"});
                } else {
                    if (contentCheck(req.body.content)) {
                        let newTune = { id: nextTuneId, name: req.body.name, genreId: req.params.genreId, content: req.body.content};
                        tunes.push(newTune);
                        nextTuneId++;
                        res.status(201).json(newTune);
                    }   
                }
            }
        } 
        if (res.statusCode !== 201) {
            res.status(400).json({ 'message': "No such genre"});
        }  
    }
})
app.post(apiVersion + '/genres', (req, res) => {  
    if (req.body === undefined || req.body.genreName === undefined) {
        res.status(400).json({ 'message': "Genres require a name in the request body"});
    } else {
        let newGenre = { id: nextGenreId, genreName: req.body.genreName};
        genres.push(newGenre);
        nextGenreId++;
        res.status(201).json(newGenre);
    }
})
app.patch(apiVersion + '/genres/:genreId/tunes/:id', (req, res) => {
    let arrayIndex = -1;
    for (let i=0;i<tunes.length;i++) {
        if (tunes[i].id === req.params.id) {
            arrayIndex = i;
        }
    }
    if (req.body === undefined) {
        res.status(400).json({ 'message': "Request body needed"});
    } else {
        
        if (req.body.name !== undefined) {
            tunes[arrayIndex].name = req.body.name;
        }
        if (req.body.genreId !== undefined) {
            tunes[arrayIndex].genreId = req.params.genreId;
        }
        if (req.body.content !== undefined) {
            tunes[arrayIndex].content = req.body.content;
        }
        
        res.status(201).json(tunes[arrayIndex]);
    }
})




//Start the server
app.listen(port, () => {
    console.log('Tune app listening on port + ' + port);
});