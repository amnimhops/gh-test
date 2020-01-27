
/**
 * Controlador de la aplicación. Se encarga de hacer los cambios
 * oportunos sobre el modelo cuando la vista informa de una acción
 * por parte del usuario.
 */
export class ListController {
    /**
     * @constructor
     * @param {ListView} view 
     * @param {ListModel} model 
     * @param {ListService} service 
     * @param {Storage} storage 
     */
    constructor(view, model, service, storage) {
        this.model = model;
        this.view = view;
        this.service = service;
        this.storage = storage;

        // Enlace con el evento de la ventana de login
        this.view.on('loginButtonClicked', async (data) => {
            this.view.showMessage('Esperando api');

            try {
                let token = await this.service.login(data.username, data.password);

                // Uno de los requisitos es guardar el token el usuario
                // de cara a futuras sesiones.
                // Necesitamos, además, el nombre de usuario para la personalización
                // del menú
                this.storage.setItem("token", token);
                this.storage.setItem("username", data.username);

                // El setter ListModel.user generará un evento que
                // notificará a la vista el cambio de usuario, para
                // que haga los arreglos oportunos
                this.model.user = data.username;

                // Cargamos toda la info del usuario
                return this.loadUserLists();

            } catch (err) {
                // Notificamos en caso de error
                this.view.showMessage('Error:' + err.message);
            }
        });

        // Enlace con la acción de cierre de sesión
        this.view.on('logoutButtonClicked', () => {
            // Quitamos también del almacen local los datos guardados
            // si los hubiera. Luego se actualiza el modelo, que notificará
            // a la vista el cambio.
            storage.removeItem('token');
            storage.removeItem('username');
            model.user = null;
        });

        // Enlace con la pulsación del botón de la ventana de registro
        this.view.on('registerButtonClicked', async (data) => {
            // Mostramos al usuario un modal, que sirve tanto a título
            // informativo como para bloquear la UI mientras esperamos respuesta
            // por parte del servidor.
            this.view.showMessage('Esperando api');

            try {
                await this.service.register(data.username, data.password);

                let token = await this.service.login(data.username, data.password);

                // Mismo procedimiento que durante el login
                this.storage.setItem("token", token);
                this.storage.setItem("username", data.username);

                this.model.user = data.username;

                return this.loadUserLists();
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        // Enlace con la acción de un cambio en el nombre de una lista
        this.view.on('listNameEdited', async (list, name) => {
            try {
                await this.service.updateList(list.id, name)
                list.name = name;
                
                // Actualizamos el modelo, que finalmente
                // avisará a la vista para hacer los cambios
                // oportunos.
                this.model.updateList(list);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        // Enlace con la acción de crear lista
        this.view.on('addListButtonClicked', async () => {
            try {
                let list = await this.service.addList("nueva lista, click para cambiar nombre");
                this.model.addList(list);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        // Enlace con la acción de borrar lista
        this.view.on('removeListButtonClicked', async (list) => {
            try {
                // Uno de los requerimientos es preguntar en caso
                // de que la lista seleccionada contenga tareas.
                if (this.model.getListTasks(list.id).length > 0) {
                    this.view.prompt("Atención", "La lista seleccionada tiene tareas asociadas. ¿Quieres eliminarla?", async (accept) => {
                        if (accept) {
                            await this.service.deleteList(list.id)
                            this.model.deleteList(list);
                        }
                    });
                } else {
                    await this.service.deleteList(list.id)
                    this.model.deleteList(list);
                }
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        // Enlace con la acción de crear tarea en una lista
        this.view.on('addTaskButtonClicked', async (list) => {
            try {
                let task = await this.service.addTask(list.id, "Nueva tarea, haz click sobre el título para cambiar el nombre")
                this.model.addTask(task);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });

        // Enlace con la acción de cambiar el nombre a una tarea
        this.view.on('taskNameEdited', async (task, name) => {
            try {
                await this.service.updateTask(task.id, name)
                task.name = name;
                this.model.updateTask(task);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
            }
        });


        // Enlace con la acción de eliminar una tarea
        this.view.on('removeTaskButtonClicked', async (task) => {
            try {
                await this.service.deleteTask(task.id);
                this.model.deleteTask(task);
            } catch (err) {
                this.view.showMessage('Error:' + err.message);
                throw err;
            }
        });

        // Enlace con la acción de borrar todas las listas
        this.view.on('eraseListsButtonClicked', () => {
            // Seleccionamos todas las listas que tengan tareas asociadas
            let listIdsWithTasks = this.model.getListIds()
                .map(id => this.model.getListTasks(id))
                .filter(taskList => taskList.length > 0)
                .map(taskList => taskList[0].idlist);
            // Para cada lista seleccionada, borramos sus tareas asociadas
            Promise
                .all(listIdsWithTasks.map(id => this.service.deleteListTasks(id)))
                .then(() => {
                    // Una vez borradas las tareas, borramos las listas padre
                    return Promise.all(this.model.getListIds().map(id => this.service.deleteList(id)));
                })
                .then(() => {
                    // Borradas las listas y las tareas, actualizamos el modelo
                    this.model.clearTasks();
                    this.model.clearLists();

                    this.view.showMessage('Todos los datos borrados');
                })
                .catch((err) => {
                    this.view.showMessage('Error:' + err.message);
                });
        });

        // Finalmente, si había un token de usuario, lo cargamos en el servicio
        // y actualizamos el modelo para informar a la vista.
        if (storage.getItem('token')) {
            this.service.token = storage.getItem('token')
            this.model.user = storage.getItem('username');
            this.loadUserLists();
        } else {
            this.model.user = null;
        }
    }
    /**
     * Carga todas las listas del usuario, con todas las tareas asociadas
     */
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