export class Task{
    constructor(data){
        data = data || {};
        this.id = data.id || null;
        this.idlist = data.idlist || null;
        this.task = data.task || null;
        this.updated_at = data.updated_at || null;
        this.updatedAt = data.updatedAt || null;
        this.created_at = data.created_at || null;
        this.createdAt = data.createdAt || null;
    }
}