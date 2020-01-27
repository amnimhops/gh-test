import { EventEmitter } from "../../models/events.js";

/**
 * Esta clase se corresponde con el modelo de datos mostrado por la vista
 * y manipulado por el controlador.
 * 
 * @fires userChanged Notifica un cambio en el usuario
 * @fires listAdded Notifica la inserción de una lista en el modelo
 * @fires listUpdated Notifica el cambio de una lista del modelo
 * @fires listDeleted Notifica la eliminación de una lista del modelo
 * @fires taskAdded Notifica la inserción de una tarea en el modelo
 * @fires taskUpdated Notifica el cambio de una tarea del modelo
 * @fires taskDeleted Notifica la eliminación de una tarea del modelo
 */
export class ListModel extends EventEmitter {
    constructor() {
        super();
        /**
         * @member {string} Nombre del usuario, visible en el greeter
         */
        this._user = null;
        /**
         * @member {List[]} Lista de listas del usuario
         */
        this._lists = [];
        /**
         * @member {Task[]} Lista de tareas del usuario
         */
        this._tasks = [];
    }

    /**
     * Cambia la variable "privada" _user y notifica
     * a cualquier observador este hecho 
     * @fires userChanged
     * @param {string} user
     */
    set user(user) {
        this._user = user;
        this.raise('userChanged', user);
    }
    /**
     * @returns {string} Devuelve el nombre del usuario
     */
    get user() {
        return this._user;
    }
    /**
     * @returns {number[]} Devuelve la lista de identificadores de todas las listas del modelo
     */
    getListIds() {
        return this._lists.map(list => list.id);
    }
    /**
     * Devuelve una colección con todas las tareas con el mismo id de lista
     * @param {number} Identificador de la lista a la que pertenecen las tareas
     * @return {Task[]} Lista de las tareas encontradas
     */
    getListTasks(id) {
        return this._tasks.filter(task => task.idlist == id);
    }
    /**
     * Añade una lista al model
     * @param {List} list 
     * @fires listAdded
     */
    addList(list) {
        this._lists.push(list);
        this.raise('listAdded', list);
    }
    /**
     * Actualiza una lista en el modelo
     * @param {List} list 
     * @fires listUpdated
     */
    updateList(list) {
        if (this._lists.indexOf(list) === -1) throw 'La lista no existe';
        this.raise('listUpdated', list);
    }
    /**
     * Borra una lista del modelo
     * @param {List} list 
     * @fires listDeleted
     */
    deleteList(list) {
        if (this._lists.indexOf(list) === -1) throw 'La lista no existe';
        this._lists.splice(this._lists.indexOf(list), 1);
        this.raise('listDeleted', list);
    }
    /**
     * Añade una lista al modelo
     * @param {Task} task 
     * @fires taskAdded
     */
    addTask(task) {
        this._tasks.push(task);
        this.raise('taskAdded', task);
    }
    /**
     * Modifica una lista del modelo
     * @param {Task} task 
     * @fires taskUpdated
     */
    updateTask(task) {
        if (this._tasks.indexOf(task) === -1) throw 'La tarea no existe';
        this.raise('taskUpdated', task);
    }
    /**
     * Borra una lista del modelo
     * @param {Task} task 
     * @fires taskDeleted
     */
    deleteTask(task) {
        if (this._tasks.indexOf(task) === -1) throw 'La tarea no existe';
        this._tasks.splice(this._tasks.indexOf(task), 1);
        this.raise('taskDeleted', task);
    }
    /**
     * Borra todas las tareas del usuario
     * @fires taskDeleted Este evento se dispara una vez por cada lista
     */
    clearTasks() {
        this._tasks.forEach(task => this.raise('taskDeleted', task));
        this._tasks = [];
    }
    /**
     * Borra todas las listas del usuario
     * @fires listDeleted Este evento se dispara una vez por cada lista
     */
    clearLists() {
        this._lists.forEach(list => this.raise('listDeleted', list));
        this._lists = [];
    }
}
