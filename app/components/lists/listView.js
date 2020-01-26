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
export class ListView extends EventEmitter {
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