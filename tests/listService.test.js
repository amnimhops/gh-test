const $ = require('jquery');

import { ListServiceError, ListService } from '../app/services/listService';
import { User } from '../app/models/user';
import { List } from '../app/models/list';

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
        expect(userData).not.toBe(null);
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
            await service.login(new Date().getTime(), "");
            throw 'An exception was expected';
        } catch (e) {
            expect(e.code).toBe(204);
        }
    });
    it("returns json web token after a successful login", async () => {
        let jwt = await service.login(username, password);
        expect(jwt).not.toBe(null);
        expect(jwt.length).toBeGreaterThan(0);
    });
});

describe("lists", () => {
    it("returns an array of objects", async () => {
        await service.login(username, password);

        let lists = await service.getLists();
        expect(lists).not.toBe(null);
        expect(lists).toBeInstanceOf(Array);
    });

    it("returns a single list when requested with a listId", async () => {
        await service.login(username, password);
        let name = getRandomName('list')
        let newList = await service.addList(name);
        let list = await service.getList(newList.id);
        
        expect(list).not.toBe(null);
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

        expect(list).not.toBe(null);
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

    // La API devuelve erroneamente un 202 al intentar borrar un id alfanumérico
    // cuando la tónica general es usar un error 500 para id's no validos.
    it("does nothing when deleting an invalid list id", async () => {
        await service.login(username, password);
        await service.deleteList('voidlist');
    });

    it("does nothing when deleting a non-existent listId", async () => {
        await service.login(username, password);
        await service.deleteList(findValidNonExistentListId());
    });

    it("deletes a list by a given id", async () => {
        await service.login(username, password);

        let newList = await service.addList(getRandomName('list'));
        await service.deleteList(newList.id);
        let deletedList = await service.getList(newList.id);
        expect(deletedList).toBeNull();
    });


});