import { EventEmitter } from "../../models/events.js";

export class ListModel extends EventEmitter {
    constructor() {
        super();

        this._user = null;
        this._lists = [];
        this._tasks = [];
    }

    set user(user) {
        this._user = user;
        this.raise('userChanged', user);
    }
    get user() {
        return this._user;
    }
    /**
     * @returns {number[]} Devuelve la lista de identificadores de todas las listas del modelo
     */
    getListIds() {
        return this._lists.map(list => list.id);
    }
    getListTasks(id) {
        return this._tasks.filter(task => task.idlist == id);
    }
    addList(list) {
        this._lists.push(list);
        this.raise('listAdded', list);
    }
    updateList(list) {
        if (this._lists.indexOf(list) === -1) throw 'La lista no existe';
        this.raise('listUpdated', list);
    }
    deleteList(list) {
        if (this._lists.indexOf(list) === -1) throw 'La lista no existe';
        this._lists.splice(this._lists.indexOf(list), 1);
        this.raise('listDeleted', list);
    }
    addTask(task) {
        this._tasks.push(task);
        this.raise('taskAdded', task);
    }
    updateTask(task) {
        if (this._tasks.indexOf(task) === -1) throw 'La tarea no existe';
        this.raise('taskUpdated', task);
    }
    deleteTask(task) {
        if (this._tasks.indexOf(task) === -1) throw 'La tarea no existe';
        this._tasks.splice(this._tasks.indexOf(task), 1);
        this.raise('taskDeleted', task);
    }

    clearTasks() {
        this._tasks.forEach(task => this.raise('taskDeleted', task));
        this._tasks = [];
    }
    clearLists() {
        this._lists.forEach(list => this.raise('listDeleted', list));
        this._lists = [];
    }
}
