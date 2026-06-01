export class ApiResponse  {
    
    success= true;
    // meta_example: {
    //     total: 48,
    //     page: 1,
    //     lastPage: 5
    //    }
    constructor(data, meta){
        this.data = data;
        this.meta = meta || {};
    }
}