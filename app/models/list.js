export class List{
    constructor(data){
        data = data || {};
        this.id = data.id || null;
        this.name = data.name || null;
        this.id_user = data.id_user || null;
        this.updated_at = data.updated_at || null;
        this.updatedAt = data.updatedAt || null;
        this.createdAt = data.createdAt || null;
        this.created_at = data.created_at || null;
    }
}