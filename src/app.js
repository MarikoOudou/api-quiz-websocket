"use strict";
exports.__esModule = true;
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
//const responses = require('./routes/responses');
var app = express();
var cors = require('cors');
var router = require('websocket').router;
// use it before all route definitions
app.use(cors({ origin: '*' }));
// Tester la connexion
var expressWs = require('express-ws')(app);
var wsInstance = expressWs.getWss('/');
var dataservice_1 = require("./dataservice");
// Create connection
var db = mysql.createConnection({
    host: 'localhost',
    port: '8889',
    user: 'root',
    password: 'root',
    database: 'mysqlnode'
});
// Connect 
db.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log('Mysql Connected...');
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.ws('/', function (ws, req) {
    ws.on('message', function (msg) {
        console.log("message envoyé : " + msg);
        try {
            var message = JSON.parse(msg);
            if (message.type == "UNITY") {
                if (message.question_id) {
                    dataservice_1.dataService.setSession(db, message.session_id, message.question_id);
                    dataservice_1.dataService.getResultat(db, message.session_id);
                    dataservice_1.dataService.getQuestion(db, message.session_id, message.question_id).then(function (question) {
                        wsInstance.clients.forEach(function (client) {
                            client.send(JSON.stringify(question));
                        });
                    });
                }
            }
        }
        catch (error) {
        }
    });
});
// Create DB
app.get('/createdb', function (req, res) {
    var sql = 'CREATE DATABASE mysqlnode';
    db.query(sql, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        res.send('Database created...');
    });
});
// Create table
app.get('/createjoueurstable', function (req, res) {
    var sql = 'CREATE TABLE joueurs(joueur_id int AUTO_INCREMENT,mobil_id int ,j_resp_id int,quest_id int ,PRIMARY KEY (joueur_id) ,CONSTRAINT  resp_j_id FOREIGN KEY(j_resp_id) REFERENCES joueurreponses(j_resp_id),CONSTRAINT  id_1_quest FOREIGN KEY(quest_id) REFERENCES questions(quest_id))';
    db.query(sql, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        res.send('Joueurs table created...');
    });
});
// Insert post 1
app.post('/addpost1', function (req, res) {
    var post = { title: 'Post One', body: 'This is post number one' };
    console.log(req.body);
    var sql = 'INSERT INTO posts SET ?';
    var query = db.query(sql, req.body, function (err, result) {
        if (err)
            throw err;
        console.log(res);
        res.send(req.body);
    });
});
// Insert question
app.post('/addquestion', function (req, res) {
    var post = { libelle: 'Comment devez vous réagir?' };
    console.log(req.body);
    var sql = 'INSERT INTO questions SET ?';
    var query = db.query(sql, req.body, function (err, result) {
        if (err)
            throw err;
        console.log(res);
        res.send(req.body);
    });
});
// Insert reponse
app.post('/addreponse', function (req, res) {
    var post = { libelle: 'Prendre la fuite', correct: false, quest_id: 1 };
    console.log(req.body);
    var sql = 'INSERT INTO reponses SET ?';
    var query = db.query(sql, req.body, function (err, result) {
        if (err)
            throw err;
        console.log(res);
        res.send(req.body);
    });
});
// Insert récupérer réponse du joueur
app.post('/addjoueurreponses', function (req, res) {
    var post = { mobil_id: 'ODACOHORTE3', quest_id: 2, resp_id: 5 };
    console.log(req.body);
    var sql = 'INSERT INTO joueurreponses SET ?';
    var query = db.query(sql, req.body, function (err, result) {
        if (err)
            throw err;
        console.log(res);
        res.send(req.body);
    });
});
// Insert récupérer id de la session 
app.post('/addsessionid', function (req, res) {
    var post = { session_id: 'sdfg08', quest_id: 2 };
    console.log(req.body);
    var sql = 'INSERT INTO sessions SET ?';
    var query = db.query(sql, req.body, function (err, result) {
        if (err)
            throw err;
        console.log(res);
        res.send(req.body);
    });
});
//Select posts
app.get('/getposts', function (req, res) {
    var sql = 'SELECT * FROM posts ';
    var query = db.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});
//Select questions
app.get('/getquestions', function (req, res) {
    var sql = 'SELECT * FROM questions ';
    var query = db.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});
//Select reponses
app.get('/getreponses', function (req, res) {
    var sql = 'SELECT * FROM reponses ';
    var query = db.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});
//Get a question's responses by question id
app.get("/responses/:id", function (req, res) {
    var sql = "SELECT * FROM ( SELECT questions.quest_id AS id, questions.libelle AS libelle_questions, reponses.*\n        FROM questions\n        INNER JOIN reponses ON questions.quest_id = reponses.quest_id) AS B WHERE B.quest_id  = " + req.params.id;
    var query = db.query(sql, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        res.send(result);
    });
});
//Select single post 
app.get('/getpost/:id', function (req, res) {
    var sql = "SELECT * FROM posts WHERE id = " + req.params.id;
    var query = db.query(sql, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        res.send(result);
    });
});
//Select single question 
app.get('/getquestion/:id', function (req, res) {
    var sql = "SELECT * FROM questions WHERE id = " + req.params.id;
    var query = db.query(sql, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        res.send(result);
    });
});
//Select single reponse
app.get('/getreponse/:id', function (req, res) {
    var sql = "SELECT * FROM reponses WHERE id = " + req.params.id;
    var query = db.query(sql, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        res.send(result);
    });
});
// Update post
app.get('/updatepost/:id', function (req, res) {
    var newTitle = 'Updated Title';
    var sql = " UPDATE posts SET title = '" + newTitle + "' WHERE id = " + req.params.id;
    var query = db.query(sql, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        res.send('Post updated...');
    });
});
// Delete post
app.get('/deletepost/:id', function (req, res) {
    var newTitle = 'Updated Title';
    var sql = " DELETE FROM posts WHERE id = " + req.params.id;
    var query = db.query(sql, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        res.send('Post deleted...');
    });
});
var port = 8080;
app.listen(port, function () {
    console.log('Server started on port ' + port);
});
