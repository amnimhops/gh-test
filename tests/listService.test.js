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
        }catch(e){
            expect(e.code).toBe(401);
        }
    });
    it("fails when user does not exist", async()=>{
        try{
            await service.login(new Date().getTime(),"");
            throw 'An exception was expected';
        }catch(e){
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
    it("returns a new list model when a list is created", async() =>{
        await service.login(username, password);

        const name = "list-"+parseInt(Math.random()* 100);
        
        let list = await service.addList(name);
        console.log(list);
        expect(list).not.toBe(null);
        expect(list).toBeInstanceOf(List);
        expect(list.name).toBe(name);
    });

    it("fails to update a non-existent list", async() =>{
        await service.login(username, password);

        try{
            let list = await service.updateList("wtf?","wtf!");
            throw 'An exception was expected';
        }catch(e){
            expect(e.code).toBe(500);
        }
    });

    it("returns a single list when requested with a listId", async()=>{
        await service.login(username, password);
        let newList = await service.addList("xxx");
        let list = await service.getList(newList.id);
        expect(list).not.toBe(null);
        expect(list).toBeInstanceOf(List);
        
         
    });
    it.todo("fails if asked about a non-existent listId");
    it.todo("fails if asked for a non-existent listId");
    it.todo("updates an existent list");
    it.todo("fails to update a list if the id does not exist");
    it.todo("deletes a list with a given listId");
    
    it("returns an array of objects for logged user", async () => {
        await service.login(username, password);
       
        let lists = await service.getLists();
        expect(lists).not.toBe(null);
        expect(lists).toBeInstanceOf(Array);
    });
});