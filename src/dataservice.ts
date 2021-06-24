import { Data } from "./data";
type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseReject = (error?: any) => void;
export class dataService {

    static getQuestion(db: any, sessionId: string, questionId: string) {
        var result: Data = {} as Data
        let sql = `SELECT * FROM ( SELECT questions.quest_id AS id, questions.libelle AS libelle_questions, reponses.*
            FROM questions
            INNER JOIN reponses ON questions.quest_id = reponses.quest_id) AS B WHERE B.quest_id  = ${questionId}`;

        return new Promise((resolve: PromiseResolve<Data>, reject: PromiseReject): void => {
            db.query(sql, (err: any, items: any) => {
                if (err) throw err;
                result.reponses = [];
                items.forEach((element: any) => {
                    result.id = element.quest_id;
                    result.session_id = sessionId;
                    result.libelle_questions = element.libelle_questions;
                    result.reponses.push({ "resp_id": element.resp_id, "libelle": element.libelle, "correct": element.correct });
                })
                resolve(result);
            });
        });


    }


    static setSession(db: any, sessionId: string, questionId: string) {

        this.checkSession(db, sessionId).then(sessId => {
            if (sessId != null && sessId > 0) {
                this.updateSession(db, sessId, questionId);
            } else {
                this.createSession(db, sessionId, questionId);
            }
        });
    }

    static checkSession(db: any, sessionId: string) {
        let sql = `SELECT * FROM sessions WHERE session_id = '${sessionId}' limit 1`;
        return new Promise((resolve: PromiseResolve<number>, reject: PromiseReject): void => {
            db.query(sql, (err: any, items: any[]) => {
                if (err) throw err;
                resolve(items.length > 0 ? items[0].sess_id : 0);
            });
        });
    }
    static updateSession(db: any, sessId: number, questionId: string) {
        let sql = ` UPDATE sessions SET quest_id = ${questionId} WHERE sess_id = ${sessId}`;
        db.query(sql, (err: any, items: any[]) => {
            if (err) throw err;
        });
    }
    static createSession(db: any, sessionId: string, questionId: string) {
        let sql = `INSERT INTO sessions (session_id, quest_id) VALUES ('${sessionId}', ${questionId})`;
        db.query(sql, (err: any, items: any[]) => {
            if (err) throw err;
        });
    }

    static getResultat(db: any, sessionId: string) {
        var result: Data = {} as Data
        let sql = `SELECT jr.session_id,qu.libelle, (SUM(IFNULL(rep.correct,0))/(IFNULL(count(*),0))*100) 'taux'   FROM joueurreponses jr
            INNER JOIN reponses rep ON jr.resp_id = rep.resp_id
            INNER JOIN questions qu on jr.quest_id = qu.quest_id
          WHERE jr.session_id = '${sessionId}'
          GROUP BY jr.session_id,jr.quest_id`;

        return new Promise((resolve: PromiseResolve<Data>, reject: PromiseReject): void => {
            db.query(sql, (err: any, items: any) => {
                if (err) throw err;
                result.reponses = [];
                items.forEach((element: any) => {
                    result.session_id = element.sessionId;
                    result.libelle_questions = element.libelle;
                    result.taux = element.taux;
                    console.log( "sessionid", element.session_id, "libelle", element.libelle, "taux", element.taux)
                    result.reponses.push({ "sessionid": element.sessionId, "libelle": element.libelle, "taux": element.taux });
                })
                resolve(result);
            });
        });


    }
}