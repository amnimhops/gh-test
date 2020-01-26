export class EventEmitter{
    constructor(){
        this.eventMap = {};
    }
    on(event,callback){
        if(this.eventMap[event] == undefined){
            this.eventMap[event] = [];
        }
        this.eventMap[event].push(callback);
    }
    raise(event,...data){
        if(this.eventMap[event]){
            this.eventMap[event].forEach( handler => {
                handler(...data);
            });
        }
    }
}