import { User } from '../models/user';
import { List } from '../models/list';
import { Task } from '../models/task';

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
            }).done((data, textStatus, jqXHR) => {
                if (jqXHR.status == 200) {
                    this._jwt = data;
                    resolve(this._jwt);
                } else {
                    reject(new ListServiceError(jqXHR.status, textStatus));
                }
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
                url: 'https://apitrello.herokuapp.com/list/' + id,
                contentType: 'application/json'
            }).done((data) => {
                if (data.length == 0) {
                    resolve(null);
                } else {
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
                url: 'https://apitrello.herokuapp.com/list/' + id,
                data: JSON.stringify({ "name": name }),
                contentType: 'application/json'
            }).done((data) => {
                resolve(data.length == 1 && data[0] == 1);
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
                url: 'https://apitrello.herokuapp.com/list/' + id,
                contentType: 'application/json'
            }).done((data) => {
                resolve();
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async addTask(listId, name) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'POST',
                url: 'https://apitrello.herokuapp.com/tasks',
                data: JSON.stringify({ "idlist": listId, "task": name }),
                contentType: 'application/json'
            }).done((data, textStatus, jqXHR) => {
                if (jqXHR.status == 201) {
                    resolve(new Task(data));
                } else {
                    reject(new ListServiceError(jqXHR.status, textStatus));
                }
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async getListTasks(listId) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'GET',
                url: 'https://apitrello.herokuapp.com/list/tasks/' + listId,
                contentType: 'application/json'
            }).done((data) => {
                let tasks = [];
                if (data instanceof Array) tasks = data.map(element => new Task(element));

                resolve(tasks);
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async getTask(id) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'GET',
                url: 'https://apitrello.herokuapp.com/tasks/' + id,
                contentType: 'application/json'
            }).done((data) => {
                if (data) {
                    resolve(new Task(data[0]));
                } else {
                    resolve(null);
                }
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async updateTask(id, name) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'PUT',
                url: 'https://apitrello.herokuapp.com/tasks/' + id,
                data: JSON.stringify({ "taskname": name }),
                contentType: 'application/json'
            }).done((data) => {
                resolve(data.length == 1 && data[0] == 1);
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }
    async deleteListTasks(listId) {
        return new Promise((resolve, reject) => {
            this.ajax({
                headers: { 'Authorization': 'Bearer ' + this._jwt },
                method: 'DELETE',
                url: 'https://apitrello.herokuapp.com/list/tasks/' + listId,
                contentType: 'application/json'
            }).done((data, textStatus, jqXHR) => {
                if (jqXHR.status == 200) {
                    resolve();
                } else {
                    reject(new ListServiceError(jqXHR.status, textStatus));
                }
            }).fail((data) => {
                reject(new ListServiceError(data.status, data.statusText));
            });
        });
    }

}