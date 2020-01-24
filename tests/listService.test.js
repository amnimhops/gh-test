import { ListServiceError, ListService } from '../app/services/listService';

let username = "fu";
let password = "bar";
let service = new ListService();

test("success on user registration", async () => {
    expect(await service.register("fu", "bar")).toBe(true);
});

test("login fails when wrong password is supplied", async () => {
    expect(await service.login(username, "")).toThrow(Error);
});

test("login succeeds when right password is supplied", async () => {
    expect(await service.login(username, password)).toBe(true);
});

test("service methods fail if user is not logged in", async () => {
    try {
        await service.getLists();
    } catch (e) {
        expect(e).toBeInstanceOf(ListServiceError);
    }
})



