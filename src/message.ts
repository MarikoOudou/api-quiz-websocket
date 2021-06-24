export class SocketMessage {



    public session_id: string;
    public type: string;
    public question_id: string;

    /**
     *
     */
    constructor() {
        this.session_id = "";
        this.type = "";
        this.question_id = "";
    }
}