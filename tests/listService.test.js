const $ = require('jquery');

import { ListServiceError, ListService } from '../app/services/listService';
import { User } from '../app/models/user';
import { List } from '../app/models/list';
import { Task } from '../app/models/task';
const username = "fu";
const password = "bar";

/**
 * @type ListService
 */
let service = null;

function getRandomName(prefix) {
    return prefix + parseInt(Math.random() * 100);
}
async function findValidNonExistentListId() {
    return (await service.getLists()).reduce((max, list) => list.id > max ? list.id : max, 0) + 1;
}

beforeEach(() => {
    service = new ListService($.ajax);
});

describe('registration', () => {
    it("returns an user instance on success", async () => {
        let userData = await service.register(username, password);
        expect(userData).not.toBeNull();
        expect(userData).toBeInstanceOf(User);
    });
});

describe('login', () => {
    it("fails when wrong password is supplied", async () => {
        try {
            await service.login(username, "");
            throw 'An exception was expected';
        } catch (e) {
            expect(e.code).toBe(401);
        }
    });
    it("fails when user does not exist", async () => {
        try {
            await service.login(getRandomName("user"), "");
            throw 'An exception was expected';
        } catch (e) {
            expect(e.code).toBe(204);
        }
    });
    it("returns json web token after a successful login", async () => {
        let jwt = await service.login(username, password);
        expect(jwt).not.toBeNull();
        expect(jwt.length).toBeGreaterThan(0);
    });
});

describe("lists", () => {
    it("returns an array of objects", async () => {
        await service.login(username, password);

        let lists = await service.getLists();
        expect(lists).not.toBeNull();
        expect(lists).toBeInstanceOf(Array);
    });

    it("returns a single list when requested with a listId", async () => {
        await service.login(username, password);
        let name = getRandomName('list')
        let newList = await service.addList(name);
        let list = await service.getList(newList.id);

        expect(list).not.toBeNull();
        expect(list).toBeInstanceOf(List);
        expect(list.name).toBe(name);
    });

    it("fails if asked about an invalid listId", async () => {
        await service.login(username, password);
        try {
            await service.getList("dalist");
            throw 'An exception was expected';
        } catch (e) {
            expect(e.code).toBe(500);
        }
    });

    it("returns null if list does not exist", async () => {
        await service.login(username, password);

        let id = await findValidNonExistentListId();
        let list = await service.getList(id);
        expect(list).toBeNull();
    });

    it("returns a new list model when a list is created", async () => {
        await service.login(username, password);

        const name = getRandomName('list');

        let list = await service.addList(name);

        expect(list).not.toBeNull();
        expect(list).toBeInstanceOf(List);
        expect(list.name).toBe(name);
    });

    it("does nothing when updating a non-existent list", async () => {
        await service.login(username, password);

        let id = await findValidNonExistentListId();
        let success = await service.updateList(id);
        expect(success).toBe(false);

    });

    it("update list name by a given listId", async () => {
        await service.login(username, password);

        const name = getRandomName('list');
        const newName = name + '-bis';
        let list = await service.addList(name);
        let success = await service.updateList(list.id, newName);
        expect(success).toBe(true);
        expect((await service.getList(list.id)).name).toBe(newName);
    });

    it("does nothing when deleting an invalid list id", async () => {
        await service.login(username, password);
        await service.deleteList('voidlist');
    });

    it("does nothing when deleting a non-existent listId", async () => {
        await service.login(username, password);
        await service.deleteList(await findValidNonExistentListId());
    });

    it("deletes a list by a given id", async () => {
        await service.login(username, password);

        let newList = await service.addList(getRandomName('list'));
        await service.deleteList(newList.id);
        let deletedList = await service.getList(newList.id);
        expect(deletedList).toBeNull();
    });
});

describe("tasks", () => {
    it("fails to add a task to a non-existent list",async()=>{
        await service.login(username, password);

        try{
            await service.addTask(await findValidNonExistentListId(),"newtask");
            throw 'An exception was expected';
        }catch(e){
            expect(e.code).toBe(200);
        }
    });

    it("adds new tasks to an existent list",async()=>{
        await service.login(username, password);
        let taskName = getRandomName('task');
        let list = await service.addList('newlist');
        let task = await service.addTask(list.id,taskName);
        expect(task).not.toBeNull();
        expect(task).toBeInstanceOf(Task);
        expect(task.task).toBe(taskName);
    });

    it("returns a list of tasks for an existent list",async()=>{
        await service.login(username, password);
        
        let list = await service.addList('newlist');
        await service.addTask(list.id,getRandomName('task'));
        await service.addTask(list.id,getRandomName('task'));

        let tasks = await service.getListTasks(list.id);
         
        expect(tasks).not.toBeNull();
        expect(tasks).toBeInstanceOf(Array);
        expect(tasks.length).toBe(2);
    });

    it("fails to delete all tasks for a non-existent list",async()=>{
        await service.login(username, password);
        try{
            await service.deleteListTasks(await findValidNonExistentListId());
            throw 'An exception was expected';
        }catch(e){
            expect(e.code).toBe(204);
        }
    });

    it("returns an empty array for lists without tasks",async()=>{
        await service.login(username, password);

        let newList = await service.addList(getRandomName('list'));
        let tasks = await service.getListTasks(newList.id);
        expect(tasks).not.toBeNull();
        expect(tasks).toBeInstanceOf(Array);
        expect(tasks.length).toBe(0);
    })
    
    it("deletes tasks given a valid list id",async()=>{
        await service.login(username, password);

        let newList = await service.addList(getRandomName('list'));

        await service.addTask(newList.id,getRandomName('task'));
        await service.deleteListTasks(newList.id);

        let tasks = await service.getListTasks(newList.id);
        expect(tasks.length).toBe(0);
    });

    it("returns null when a non-existent task is queried",async()=>{
        await service.login(username, password);

        
        let newList = await service.addList(getRandomName('list'));
        let task = await service.addTask(newList.id,getRandomName('task'));
        await service.deleteListTasks(newList.id);
        let testTask = await service.getTask(task.id);
        expect(testTask).toBeNull();
    });

    it("returns false when non-existent task is updated",async()=>{
        await service.login(username, password);

        
        let newList = await service.addList(getRandomName('list'));
        let task = await service.addTask(newList.id,getRandomName('task'));
        
        await service.deleteListTasks(newList.id);
        
        let newName = getRandomName("task");
        let success = await service.updateTask(task.id,newName);
        expect(success).toBe(false);

    });

    it("returns true when a task is successfully updated",async()=>{
        await service.login(username, password);

        let newList = await service.addList(getRandomName('list'));
        let task = await service.addTask(newList.id,getRandomName('task'));
        let newName = getRandomName("task");
        let success = await service.updateTask(task.id,newName);
        expect(success).toBe(true);
    });
});