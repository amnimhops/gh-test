const $ = require('jquery');

import { ListServiceError, ListService } from '../app/services/listService';
import { User } from '../app/models/user';

const username = "fu";
const password = "bar";
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
        expect(await service.login(username, "")).toThrow(ListServiceError);
    });
    it("returns json web token after a successful login", async () => {
        let jwt = await service.login(username, password);
        expect(jwt).not.toBe(null);
        expect(jwt.length).toBeGreatherThan(0);
    });
});
/*
describe("getLists", () => {
    it("returns an array of objects", async () => {
        await service.login(username, password);
        
        let lists = await service.getLists();
        expect(lists).toBeInstanceOf(Array);
    });
})

*/