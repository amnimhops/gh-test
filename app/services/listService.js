import { User } from '../models/user';
import { List } from '../models/list';

export class ListServiceError {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}

export class ListService {
    constructor(ajax) {
        this.ajax = ajax;
        this._jwt = null;
    }
    
    async register(user, password) {
        return new Promise((resolve, reject) => {
            this.ajax({
                method: 'POST',
                url: 'https://apitrello.herokuapp.com/users',
                data: JSON.stringify({ "username": user, "password": password }),
                contentType: 'application/json'
            }).done((data) => {
                resolve(new User(data));
            }).fail((data) => {
                reject(data);
            });
        });
    }
    async login(user, password) {
        return new Promise((resolve, reject) => {
            this.ajax({
                method: 'POST',
                url: 'https://apitrello.herokuapp.com/users/login',
                data: JSON.stringify({ "username": user, "password": password }),
                contentType: 'application/json'
            }).done((data) => {
                this._jwt = data;
                resolve(this._jwt);
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async getLists() {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'GET',
                url: 'https://apitrello.herokuapp.com/list',
                contentType: 'application/json'
            }).done((data) => {
                resolve(data.map(element => new List(element)));
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    /**
     * @async
     * @param {number} id List identifier
     * @return {Promise<List[]>} List details
     */
    async getList(id) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'GET',
                url: 'https://apitrello.herokuapp.com/list/'+id,
                contentType: 'application/json'
            }).done((data) => {
                if(data.length == 0){
                    resolve(null);
                }else{
                    resolve(new List(data[0]));
                }
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    /**
     * @async
     * @param {number} id List identifier
     * @return {Promise<List>} List details
     */
    async addList(name) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'POST',
                url: 'https://apitrello.herokuapp.com/list',
                data: JSON.stringify({ "name": name }),
                contentType: 'application/json'
            }).done((data) => {
                resolve(new List(data));
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async updateList(id, name) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'PUT',
                url: 'https://apitrello.herokuapp.com/list/'+id,
                data: JSON.stringify({ "name": name }),
                contentType: 'application/json'
            }).done((data) => {
                resolve(data.length==1 && data[0] == 1);
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async deleteList(id) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'DELETE',
                url: 'https://apitrello.herokuapp.com/list/'+id,
                contentType: 'application/json'
            }).done((data) => { 
                resolve();
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async addTask(listId, name) {

    }
    async getListTasks(listId) {

    }
    async getTask(id) {

    }
    async updateTask(id, name) {

    }
    async deleteListTasks(id) {

    }

}