import { ListService } from "../services/listService.js";
import { EventEmitter } from "../models/events.js";
import { List } from "../models/list.js";

const KeyEscape = 27;
const KeyIntro = 13;
/**
 * @fires userChanged
 * @fires taskAdded
 * @fires taskUpdated
 * @fires taskDeleted
 * @fires listAdded
 * @fires listEdited
 * @fires listDeleted
 */
export class UserModel extends EventEmitter {
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


/**
 * @fires loginButtonClicked
 * @fires logoutButtonClicked
 * @fires registerButtonClicked
 * @fires addListButtonClicked
 * @fires removeListButtonClicked
 * @fires eraseListsButtonClicked
 * @fires listNameEdited
 * @fires addTaskButtonClicked
 * @fires removeTaskButtonClicked
 * @fires taskNameEdited
 */
export class UserView extends EventEmitter {
    constructor(model, jQuery) {
        super();
        this.model = model;
        this.$ = jQuery;

        this.$("#login-link").click(() => {
            this.showView('login-view');
        });
        this.$("#logout-link").click(() => {
            this.raise('logoutButtonClicked');
        });
        this.$("#register-link").click(() => {
            this.showView('register-view');
        });
        this.$("#submit-login").click(() => {
            let username = this.$("#login-frm input[name=username]").val();
            let password = this.$("#login-frm input[name=password]").val();

            if (username && password) {
                this.raise('loginButtonClicked', { username, password });
            }
        });
        this.$("#submit-register").click(() => {
            let username = this.$("#register-frm input[name=username]").val();
            let password = this.$("#login-frm input[name=password]").val();

            if (username && password) {
                this.raise('registerButtonClicked', { username, password });
            }
        })
        this.$("#info>div>span").click(() => {
            this.hideMessage();
        });
        this.$("#add-task").click(() => {
            this.raise('addListButtonClicked');
        });
        this.$("#erase-tasks").click(() => {
            this.raise('eraseListsButtonClicked');
        });
        model.on('userChanged', (user) => {
            if (user == null) {
                this.reset();
            } else {
                this.$("#login-link").hide();
                this.$("#logout-link").show();
                this.$("#register-link").hide();
                this.showView(null);
                this.greeter = "Hola, " + user;
            }
        });

        model.on('listAdded', (list) => {
            this.addList(list);
        });

        model.on('listUpdated', (list) => {
            this.$(`#list-${list.id}>h3`).text(list.name);
        })

        model.on('listDeleted', (list) => {
            this.$(`#list-${list.id}`).fadeOut("fast", () => {
                this.$(`#list-${list.id}`).remove();
            });
        });

        model.on('taskAdded', (task) => {
            this.addTask(task);
        });

        model.on('taskDeleted', (task) => {
            this.$(`#task-${task.id}`).remove();
        });

    }

    set greeter(message) {
        if (!message) {
            this.$("#greeter").hide();
        } else {
            this.$("#greeter").show();
            this.$("#greeter").text(message);
        }
    }

    reset() {
        this.$("#list-holder").empty();
        this.$("#login-link").show();
        this.$("#logout-link").hide();
        this.$("#register-link").show();
        this.showView('home-view');
        this.greeter = null;

    }
    /**
     * 
     * @param {List} list 
     */
    addList(list) {
        this.$("#list-holder").append(`<li id="list-${list.id}"></li>`);
        this.$(`#list-${list.id}`).append(`<span class="opts">&times;</span>`);
        this.$(`#list-${list.id}`).append(`<h3>${list.name}</h3>`);
        this.$(`#list-${list.id}`).append(`<div class="task-holder"><ul></ul><span class="newtask">Crear una tarea...</span></div>`);

        this.$(`#list-${list.id}>span`).click(() => this.deleteList(list));

        this.$(`#list-${list.id} h3`)
            .click(() => this.startListEdition(list))
            .on('keydown', (event) => {
                if (event.keyCode == KeyEscape) {
                    this.cancelListEdition(list);
                } else if (event.keyCode == KeyIntro) {
                    this.completeListEdition(list);
                    event.preventDefault();
                }
            });
        this.$(`#list-${list.id}>div.task-holder>span.newtask`).click(() => {
            this.raise('addTaskButtonClicked', list);
        });

    }

    startListEdition(list) {
        let h3 = this.$(`#list-${list.id} h3`);
        h3.addClass('editing').attr('contenteditable', true);
        h3.focusout(() => this.completeListEdition(list));
        h3.focus()
    }
    cancelListEdition(list) {
        let h3 = this.$(`#list-${list.id} h3`);
        h3.attr('contenteditable', false);
        h3.removeClass('editing');
        h3.text(list.name);
    }
    completeListEdition(list) {
        let newName = this.$(`#list-${list.id} h3`).text();
        // No se hace nada si el nombre no ha cambiado
        if (newName != list.name) {
            this.raise('listNameEdited', list, newName);
        }

        let h3 = this.$(`#list-${list.id} h3`);
        h3.attr('contenteditable', false);
        h3.removeClass('editing');
    }

    deleteList(list) {
        this.raise('removeListButtonClicked', list);
    }

    addTask(task) {
        let ul = this.$(`#list-${task.idlist}>div.task-holder>ul`);
        ul.append(`<li id="task-${task.id}"><span class="remove-task">&times;</span><span class="date">${task.createdAt}</span><span class="title">${task.task}</span></li>`);
        this.$(`#task-${task.id}>span.remove-task`).click(() => {
            this.raise('removeTaskButtonClicked', task);
        });
        this.$(`#task-${task.id}>span.title`)
            .click(() => this.startTaskEdition(task))
            .on('keydown', (event) => {
                if (event.keyCode == KeyEscape) {
                    this.cancelTaskEdition(task);
                } else if (event.keyCode == KeyIntro) {
                    this.completeTaskEdition(task);
                    event.preventDefault();
                }
            });
    }

    startTaskEdition(task) {
        let title = this.$(`#task-${task.id} span.title`);
        title.addClass('editing').attr('contenteditable', true);
        title.focusout(() => this.completeTaskEdition(task));
        title.focus()
    }
    cancelTaskEdition(task) {
        let title = this.$(`#task-${task.id} span.title`);
        title.attr('contenteditable', false);
        title.removeClass('editing');
        title.text(task.name);
    }
    completeTaskEdition(task) {
        let newName = this.$(`#task-${task.id} span.title`).text();
        // No se hace nada si el nombre no ha cambiado
        if (newName != task.name) {
            this.raise('taskNameEdited', task, newName);
        }

        let title = this.$(`#task-${task.id} span.title`);
        title.attr('contenteditable', false);
        title.removeClass('editing');
    }


    showMessage(message, timeout) {
        let title = null;
        let text = null;
        let closeable = true;
        if (typeof (message) === 'string') {
            title = message;
            text = '';
        } else {
            title = message.title;
            text = message.text;
            closeable = message.closeable;
        }

        this.$("#info>div>h2").text(title);
        this.$("#info>div>div").text(text);
        if (closeable) {
            this.$("#info>div>span").show();
        } else {
            this.$("#info>div>span").hide();
        }

        this.$("#info").show();

        if (timeout) {
            setTimeout(() => this.hideMessage(), timeout);
        }
    }

    hideMessage() {
        this.$("#info").hide();
    }

    showView(view) {
        this.$("#app-views>div").hide();
        if (view) {
            this.$("#" + view).show();
        }
    }
}
export class UserController {
    /**
     * 
     * @param {MenuView} view 
     * @param {*} model 
     * @param {ListService} service 
     * @param {Storage} storage 
     * @param {JQuery} jquery 
     */
    constructor(view, model, service, storage, jQuery) {
        this.$ = jQuery;
        this.model = model;
        this.view = view;
        this.service = service;
        this.storage = storage;

        // Enlazamos el controlador con los eventos procedentes de la vista

        this.view.on('loginButtonClicked', async (data) => {
            this.view.showMessage('Esperando api');
            console.log('Comenzando login,datos recibidos', data);

            let token = await this.service.login(data.username, data.password);
            this.storage.setItem("token", token);
            this.storage.setItem("username", data.username);
            this.model.user = data.username;

            return this.loadUserLists();
        });

        this.view.on('logoutButtonClicked', () => {
            storage.removeItem('token');
            storage.removeItem('username');
            model.user = null;
        });

        this.view.on('removeListButtonClicked', (list) => {
            console.log(list);
        });

        this.view.on('listNameEdited', async (list, name) => {
            try {
                let success = await this.service.updateList(list.id, name)
                list.name = name;
                this.model.updateList(list);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        this.view.on('addListButtonClicked', async () => {
            try {
                let list = await this.service.addList("nueva lista, click para cambiar nombre");
                this.model.addList(list);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        this.view.on('removeListButtonClicked', async (list) => {
            try {
                await this.service.deleteList(list.id)
                this.model.deleteList(list);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        this.view.on('addTaskButtonClicked', async (list) => {
            try {
                let task = await this.service.addTask(list.id, "Nueva tarea, haz click sobre el título para cambiar el nombre")
                this.model.addTask(task);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });
        this.view.on('taskNameEdited', async (task, name) => {
            try {
                let success = await this.service.updateTask(task.id, name)
                task.name = name;
                this.model.updateTask(task);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        this.view.on('removeTaskButtonClicked', async (task) => {
            try {
                await this.service.deleteTask(task.id);
                this.model.deleteTask(task);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
                throw err;
            }
        });
        this.view.on('eraseListsButtonClicked', () => {
            // Borramos todas las tareas de todas las listas con tareas
            let listIdsWithTasks = this.model.getListIds()
                .map(id => this.model.getListTasks(id))
                .filter(taskList => taskList.length > 0)
                .map(taskList => taskList[0].idlist);

            Promise
                .all(listIdsWithTasks.map(id => this.service.deleteListTasks(id)))
                .then(() => {
                    return Promise.all(this.model.getListIds().map(id => this.service.deleteList(id)));
                })
                .then(() => {
                    this.model.clearTasks();
                    this.model.clearLists();
                    this.view.showMessage('Todos los datos borrados');
                })
                .catch((err) => {
                    this.view.showMessage('Error:' + err.message);
                });
        });


        // Si había un token de usuario, lo cargamos en el servicio
        // y actualizamos el modelo para informar a la vista
        if (storage.getItem('token')) {
            this.service.token = storage.getItem('token')
            this.model.user = storage.getItem('username');
            this.loadUserLists();
        } else {
            this.model.user = null;
        }
    }

    async loadUserLists() {
        this.view.showMessage('Cargando listas de usuario');

        let lists = await this.service.getLists()
        this.view.showView('lists-view');

        lists.forEach(list => this.model.addList(list));

        // Cargamos de golpe las tareas correspondientes a todas las listas
        // que tenga asignada el usuario
        Promise.all(lists.map(list => this.service.getListTasks(list.id))).then((tasksLists) => {
            // taskLists es un array con los resultados de cada promesa cumplida
            // lo convertimos en una lista plana y lo añadimos al modelo
            tasksLists.flat().forEach(task => this.model.addTask(task));
            this.view.hideMessage();
        }).catch(err => {
            this.view.showMessage('Error:' + err.message);
        });



    }

}