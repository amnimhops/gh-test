export class User{
    constructor(data){
        data = data || {};
        this.id = data.id || null;
        this.username = data.username || null;
        this.updatedAt = data.updatedAt || null;
        this.createdAt = data.createdAt || null;
    }
}