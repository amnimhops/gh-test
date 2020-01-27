import {EventEmitter} from '../../models/events.js';

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

/**
 * @constant Código numérico de la tecla escape
 */
const KeyEscape = 27;
/**
 * @constant Código numérico de la tecla enter
 */
const KeyIntro = 13;

/**
 * Vista de la aplicación. Esta clase se encarga de visualizar
 * la información contenida en el modelo de datos y de transmitir
 * a los observadores externos las acciones del usuario.
 */
export class ListView extends EventEmitter {
    /**
     * @constructor
     * @param {ListModel} model 
     * @param {JQuery} jQuery 
     */
    constructor(model, jQuery) {
        super();
        this.model = model;
        this.$ = jQuery;
        
        // Bindings con la interfaz
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
            }else{
                this.showMessage('Hay que proporcionar usuario y clave para confirmar la identidad');
            }
            // Prevenimos el submit del formulario
            return false;
        });
        this.$("#submit-register").click(() => {
            let username = this.$("#register-frm input[name=username]").val();
            let password = this.$("#register-frm input[name=password]").val();

            if (username && password) {
                this.raise('registerButtonClicked', { username, password });
            }else{
                this.showMessage('Hay que proporcionar usuario y clave para el registro');
            }
            // Prevenimos el submit del formulario
            return false;
        });
        this.$("#info>div>span").click(() => {
            this.hideMessage();
        });
        this.$("#add-task").click(() => {
            this.raise('addListButtonClicked');
        });
        this.$("#erase-tasks").click(() => {
            this.raise('eraseListsButtonClicked');
        });

        // Nos suscribimos a los cambios en el usuario
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
        // Nos suscribimos a los cambios en las listas
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
        // Nos suscribimos a los cambios en las tareas
        model.on('taskAdded', (task) => {
            this.addTask(task);
        });

        model.on('taskDeleted', (task) => {
            this.$(`#task-${task.id}`).remove();
        });

    }

    /**
     * Cambia el mensaje de bienvenida en el menú, o lo oculta
     * en caso de un mensaje vacío
     * @param {string} message
     */
    set greeter(message) {
        if (!message) {
            this.$("#greeter").hide();
        } else {
            this.$("#greeter").show();
            this.$("#greeter").text(message);
        }
    }

    /**
     * Resetea la vista a su valor original
     */
    reset() {
        this.$("#list-holder").empty();
        this.$("#login-link").show();
        this.$("#logout-link").hide();
        this.$("#register-link").show();
        this.showView('home-view');
        this.greeter = null;

    }
    /**
     * Crea la UI correspondiente a una lista
     * @param {List} list 
     */
    addList(list) {
        this.$("#list-holder").append(`<li id="list-${list.id}"></li>`);
        this.$(`#list-${list.id}`).append(`<span class="remove-list">&times;</span>`);
        this.$(`#list-${list.id}`).append(`<h3>${list.name}</h3>`);
        this.$(`#list-${list.id}`).append(`<div class="task-holder"><ul></ul></div>`);
        this.$(`#list-${list.id}`).append(`<span class="newtask">Crear una tarea...</span>`);

        this.$(`#list-${list.id}>span.remove-list`).click(() => this.deleteList(list));

        // Se ha empleado la característica contentEditable de HTML5
        // en lugar de usar múltiples ventanas y/o popups
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

        this.$(`#list-${list.id}>span.newtask`).click(() => {
            this.raise('addTaskButtonClicked', list);
        });

    }
    /**
     * Pone una lista en modo edición, cambiando
     * las propiedades de la interfaz para poder
     * cambiar el nombre
     * @param {List} list 
     */
    startListEdition(list) {
        let h3 = this.$(`#list-${list.id} h3`);
        h3.addClass('editing').attr('contenteditable', true);
        h3.focusout(() => this.completeListEdition(list));
        h3.focus()
    }
    /**
     * Cancela el modo edición de una lista, devolviendo
     * la interfaz a su estado original
     * @param {List} list 
     */
    cancelListEdition(list) {
        let h3 = this.$(`#list-${list.id} h3`);
        h3.attr('contenteditable', false);
        h3.removeClass('editing');
        h3.text(list.name);
    }
    /**
     * Completa el modo edición, devolviendo la interfaz
     * a su estado original y emitiendo un evento para informar
     * a los observadores de este cambio
     * 
     * @param {List} list 
     * @fires listNameEdited
     */
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

    /**
     * Comunica a los observadores la intención del usuario
     * de eliminar una lista
     * @param {List} list 
     * @fires removeListButtonClicked
     */
    deleteList(list) {
        this.raise('removeListButtonClicked', list);
    }
    /**
     * Añade los elementos necesarios a la interfaz
     * para controlar una lista dentro de una tarea
     * 
     * @param {Task} task 
     */
    addTask(task) {
        let ul = this.$(`#list-${task.idlist}>div.task-holder>ul`);
        ul.append(`<li id="task-${task.id}"><span class="remove-task" title="Eliminar tarea">&times;</span><span class="header">#${task.id} &middot; Creada el ${task.createdAt}</span><span class="title" title="Click para cambiar">${task.task}</span></li>`);
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
     /**
     * Pone una tarea en modo edición, cambiando
     * las propiedades de la interfaz para poder
     * cambiar el nombre
     * @param {Task} task
     */
    startTaskEdition(task) {
        let title = this.$(`#task-${task.id} span.title`);
        title.addClass('editing').attr('contenteditable', true);
        title.focusout(() => this.completeTaskEdition(task));
        title.focus()
    }
    /**
     * Cancela el modo edición de una tarea, devolviendo
     * la interfaz a su estado original
     * @param {Task} task
     */
    cancelTaskEdition(task) {
        let title = this.$(`#task-${task.id} span.title`);
        title.attr('contenteditable', false);
        title.removeClass('editing');
        title.text(task.name);
    }
    /**
     * Completa el modo edición, devolviendo la interfaz
     * a su estado original y emitiendo un evento para informar
     * a los observadores de este cambio
     * 
     * @param {Task} task
     * @fires taskNameEdited
     */
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

    /**
     * Muestra un mensaje modal que bloquea la interfaz con un velo.
     * 
     * @param {any} message Mensaje que se mostrará. Si es un objeto, contendrá el título y el mensaje
     * @param {number} timeout Milisegundos tras los cuales se ocultará automáticamente el mensaje
     */
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

    /**
     * Crea una ventana modal para pedir interacción (básica) al usuario
     * 
     * @param {string} title Título de la ventana
     * @param {string} message mensaje de la ventana
     * @param {Function} callback Función a la que se suministrará la decisión del usuario: true o false en función del botón empleado
     */
    prompt(title,message,callback){
        this.$("#prompt").show();
        
        this.$("#prompt h2").text(title);
        this.$("#prompt>div>div:first").text(message);
        this.$("#prompt-accept").click(()=>{
            this.$("#prompt").hide();
            // Esto es importante, múltiples invocaciones 
            // generarían múltiples ejecuciones
            this.$("#prompt-accept").unbind();
            this.$("#prompt-reject").unbind();
            callback(true);
        });
        this.$("#prompt-reject").click(()=>{
            this.$("#prompt").hide();
            this.$("#prompt-accept").unbind();
            this.$("#prompt-reject").unbind();
            callback(false);
        });        
    }
    /**
     * Oculta el mensaje de la interfaz
     */
    hideMessage() {
        this.$("#info").hide();
    }


    /**
     * Muestra una de las cuatro vistas básicas de la interfaz: home-view, login-view, register-view y lists-view
     * @param {string} view 
     */
    showView(view) {
        this.$("#app-views>div").hide();
        if (view) {
            this.$("#" + view).show();
        }
    }
}