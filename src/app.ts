const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
//const responses = require('./routes/responses');
const app = express();


const cors = require('cors');
const { router } = require('websocket');

// use it before all route definitions
app.use(cors({ origin: '*' }));


// Tester la connexion
const expressWs = require('express-ws')(app);

var wsInstance = expressWs.getWss('/');

import { Data } from "./data";
import { dataService } from "./dataservice";
import { SocketMessage } from "./message";


// Create connection

const db = mysql.createConnection({
    host: '185.98.131.149',
    port: '3306',
    user: 'scckc1565431_1pmnm',
    password: '0kqptdxozd',
    database: 'scckc1565431_1pmnm'
});

// Connect 
db.connect((err: any) => {
    if (err) {
        throw err;
    }
    console.log('Mysql Connected...');
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.ws('/', function (ws: any, req: any) {
    ws.on('message', function (msg: any) {

        console.log("message envoyé : " + msg);
        try {
            var message: SocketMessage = JSON.parse(msg);
            if (message.type == "UNITY") {
                if (message.question_id) {
                    
                    dataService.setSession(db, message.session_id,message.question_id);
                    dataService.getResultat(db,message.session_id);
                    dataService.getQuestion(db,message.session_id ,message.question_id).then(question => {
                        wsInstance.clients.forEach(function (client: any) {
                            client.send(JSON.stringify(question));
                        });
                    });

                }
            }
        } catch (error) {
        }

    });
});


// Create DB
app.get('/createdb', (req: any, res: any) => {
    let sql = 'CREATE DATABASE mysqlnode';
    db.query(sql, (err: any, result: any) => {
        if (err) throw err;
        console.log(result);
        res.send('Database created...');
    });
});
// Create table
app.get('/createjoueurstable', (req: any, res: any) => {
    let sql = 'CREATE TABLE joueurs(joueur_id int AUTO_INCREMENT,mobil_id int ,j_resp_id int,quest_id int ,PRIMARY KEY (joueur_id) ,CONSTRAINT  resp_j_id FOREIGN KEY(j_resp_id) REFERENCES joueurreponses(j_resp_id),CONSTRAINT  id_1_quest FOREIGN KEY(quest_id) REFERENCES questions(quest_id))';
    db.query(sql, (err: any, result: any) => {
        if (err) throw err;
        console.log(result);
        res.send('Joueurs table created...');
    });
});






// Insert post 1
app.post('/addpost1', (req: any, res: any) => {
    let post = { title: 'Post One', body: 'This is post number one' };
    console.log(req.body);
    let sql = 'INSERT INTO posts SET ?';
    let query = db.query(sql, req.body, (err: any, result: any) => {
        if (err) throw err;
        console.log(res);
        res.send(req.body);
    });
});


// Insert question
app.post('/addquestion', (req: any, res: any) => {
    let post = { libelle: 'Comment devez vous réagir?' };
    console.log(req.body);
    let sql = 'INSERT INTO questions SET ?';
    let query = db.query(sql, req.body, (err: any, result: any) => {
        if (err) throw err;
        console.log(res);
        res.send(req.body);
    });
});


// Insert reponse
app.post('/addreponse', (req: any, res: any) => {
    let post = { libelle: 'Prendre la fuite', correct: false, quest_id: 1 };
    console.log(req.body);
    let sql = 'INSERT INTO reponses SET ?';
    let query = db.query(sql, req.body, (err: any, result: any) => {
        if (err) throw err;
        console.log(res);
        res.send(req.body);
    });
});


// Insert récupérer réponse du joueur
app.post('/addjoueurreponses', (req: any, res: any) => {
    let post = { mobil_id: 'ODACOHORTE3', quest_id: 2, resp_id: 5 };
    console.log(req.body);
    let sql = 'INSERT INTO joueurreponses SET ?';
    let query = db.query(sql, req.body, (err: any, result: any) => {
        if (err) throw err;
        console.log(res);
        res.send(req.body);
    });
});



// Insert récupérer id de la session 
app.post('/addsessionid', (req: any, res: any) => {
    let post = { session_id: 'sdfg08', quest_id: 2};
    console.log(req.body);
    let sql = 'INSERT INTO sessions SET ?';
    let query = db.query(sql, req.body, (err: any, result: any) => {
        if (err) throw err;
        console.log(res);
        res.send(req.body);
    });
});
//Select posts
app.get('/getposts', (req: any, res: any) => {
    let sql = 'SELECT * FROM posts ';
    let query = db.query(sql, (err: any, results: any) => {
        if (err) throw err;
        console.log(results);
        res.send(results);
    });
});

//Select questions
app.get('/getquestions', (req: any, res: any) => {
    let sql = 'SELECT * FROM questions ';
    let query = db.query(sql, (err: any, results: any) => {
        if (err) throw err;
        console.log(results);
        res.send(results);
    });
});

//Select reponses
app.get('/getreponses', (req: any, res: any) => {
    let sql = 'SELECT * FROM reponses ';
    let query = db.query(sql, (err: any, results: any) => {
        if (err) throw err;
        console.log(results);
        res.send(results);
    });
});
//Get a question's responses by question id
app.get("/responses/:id", (req: any, res: any) => {

    let sql = `SELECT * FROM ( SELECT questions.quest_id AS id, questions.libelle AS libelle_questions, reponses.*
        FROM questions
        INNER JOIN reponses ON questions.quest_id = reponses.quest_id) AS B WHERE B.quest_id  = ${req.params.id}`;
    let query = db.query(sql, (err: any, result: any) => {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
})

    //req.params.id

    ;
//Select single post 
app.get('/getpost/:id', (req: any, res: any) => {
    let sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err: any, result: any) => {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});


//Select single question 
app.get('/getquestion/:id', (req: any, res: any) => {
    let sql = `SELECT * FROM questions WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err: any, result: any) => {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

//Select single reponse
app.get('/getreponse/:id', (req: any, res: any) => {
    let sql = `SELECT * FROM reponses WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err: any, result: any) => {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});
// Update post
app.get('/updatepost/:id', (req: any, res: any) => {
    let newTitle = 'Updated Title';
    let sql = ` UPDATE posts SET title = '${newTitle}' WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err: any, result: any) => {
        if (err) throw err;
        console.log(result);
        res.send('Post updated...');
    });
});


// Delete post
app.get('/deletepost/:id', (req: any, res: any) => {
    let newTitle = 'Updated Title';
    let sql = ` DELETE FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err: any, result: any) => {
        if (err) throw err;
        console.log(result);
        res.send('Post deleted...');
    });
});


var port = 8080;
app.listen(port, () => {
    console.log('Server started on port ' + port);

});