import { ListService } from '../../services/listService.js';

export class ListController {
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

            try{
                let token = await this.service.login(data.username, data.password);
                this.storage.setItem("token", token);
                this.storage.setItem("username", data.username);
                this.model.user = data.username;

                return this.loadUserLists();
            }catch(err){
                this.view.showMessage('Error:' + err.message);
            }
        });

        this.view.on('logoutButtonClicked', () => {
            storage.removeItem('token');
            storage.removeItem('username');
            model.user = null;
        });

        this.view.on('registerButtonClicked', async(data)=>{
            this.view.showMessage('Esperando api');
            console.log('Comenzando registro,datos recibidos', data);

            try{
                await this.service.register(data.username, data.password);
                let token = await this.service.login(data.username,data.password);

                this.storage.setItem("token", token);
                this.storage.setItem("username", data.username);
                
                this.model.user = data.username;

                return this.loadUserLists();
            }catch(err){
                this.view.showMessage('Error:' + err.message);
            }
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
                // Si el modelo tiene tareas asignadas, preguntar
                /*if(this.model.getListTasks(list.id).length>0){

                }*/
                this.view.prompt("Atención","La lista seleccionada tiene tareas asociadas. ¿Quieres eliminarla?",async (accept)=>{
                    if(accept){
                        await this.service.deleteList(list.id)
                        this.model.deleteList(list);                    
                    }
                });
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