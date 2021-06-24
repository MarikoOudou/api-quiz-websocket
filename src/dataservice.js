"use strict";
exports.__esModule = true;
exports.dataService = void 0;
var dataService = /** @class */ (function () {
    function dataService() {
    }
    dataService.getQuestion = function (db, sessionId, questionId) {
        var result = {};
        var sql = "SELECT * FROM ( SELECT questions.quest_id AS id, questions.libelle AS libelle_questions, reponses.*\n            FROM questions\n            INNER JOIN reponses ON questions.quest_id = reponses.quest_id) AS B WHERE B.quest_id  = " + questionId;
        return new Promise(function (resolve, reject) {
            db.query(sql, function (err, items) {
                if (err)
                    throw err;
                result.reponses = [];
                items.forEach(function (element) {
                    result.id = element.quest_id;
                    result.session_id = sessionId;
                    result.libelle_questions = element.libelle_questions;
                    result.reponses.push({ "resp_id": element.resp_id, "libelle": element.libelle, "correct": element.correct });
                });
                resolve(result);
            });
        });
    };
    dataService.setSession = function (db, sessionId, questionId) {
        var _this = this;
        this.checkSession(db, sessionId).then(function (sessId) {
            if (sessId != null && sessId > 0) {
                _this.updateSession(db, sessId, questionId);
            }
            else {
                _this.createSession(db, sessionId, questionId);
            }
        });
    };
    dataService.checkSession = function (db, sessionId) {
        var sql = "SELECT * FROM sessions WHERE session_id = '" + sessionId + "' limit 1";
        return new Promise(function (resolve, reject) {
            db.query(sql, function (err, items) {
                if (err)
                    throw err;
                resolve(items.length > 0 ? items[0].sess_id : 0);
            });
        });
    };
    dataService.updateSession = function (db, sessId, questionId) {
        var sql = " UPDATE sessions SET quest_id = " + questionId + " WHERE sess_id = " + sessId;
        db.query(sql, function (err, items) {
            if (err)
                throw err;
        });
    };
    dataService.createSession = function (db, sessionId, questionId) {
        var sql = "INSERT INTO sessions (session_id, quest_id) VALUES ('" + sessionId + "', " + questionId + ")";
        db.query(sql, function (err, items) {
            if (err)
                throw err;
        });
    };
    dataService.getResultat = function (db, sessionId) {
        var result = {};
        var sql = "SELECT jr.session_id,qu.libelle, (SUM(IFNULL(rep.correct,0))/(IFNULL(count(*),0))*100) 'taux'   FROM joueurreponses jr\n            INNER JOIN reponses rep ON jr.resp_id = rep.resp_id\n            INNER JOIN questions qu on jr.quest_id = qu.quest_id\n          WHERE jr.session_id = '" + sessionId + "'\n          GROUP BY jr.session_id,jr.quest_id";
        return new Promise(function (resolve, reject) {
            db.query(sql, function (err, items) {
                if (err)
                    throw err;
                result.reponses = [];
                items.forEach(function (element) {
                    result.session_id = element.sessionId;
                    result.libelle_questions = element.libelle;
                    result.taux = element.taux;
                    console.log("sessionid", element.session_id, "libelle", element.libelle, "taux", element.taux);
                    result.reponses.push({ "sessionid": element.sessionId, "libelle": element.libelle, "taux": element.taux });
                });
                resolve(result);
            });
        });
    };
    return dataService;
}());
exports.dataService = dataService;
