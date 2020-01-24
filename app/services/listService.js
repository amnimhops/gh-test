
export class ListServiceError extends Error{

}

export class ListService{
    constructor(ajax){
        this.ajax = ajax;
        this._jwt = null;
    }
    async register(user,password){
        
    }
    async login(user,password){
        
    }
    async getLists(){

    }
    async getList(id){
        
    }
    async createList(name){

    }
    async updateList(id,name){

    }   
    async deleteList(id){

    }
    async addTask(listId,name){

    }
    async getListTasks(listId){

    }
    async getTask(id){

    }
    async updateTask(id,name){

    }
    async deleteListTasks(id){

    }

}