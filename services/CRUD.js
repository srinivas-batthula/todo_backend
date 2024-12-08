

const ReadDB_tasks = async(Model, userId)=>{    //This method is designed to retrieve & sort the doc's of 'tasks'-DB using Aggregation-Pipelines
    try{
        let data = await Model.aggregate([
            {
                $match:{
                    user_id: userId
                }
            },
            {
                $sort:{
                    createdAt:-1
                }
            }
        ]);

        if(!data){
            return {'status':'failed', 'details':'Failed to Retrieve Data (service)'}
        }
        return {'status':'success', 'details':'data Retrieved successfully (service)', data}
    }
    catch(err){
        return {'status':'failed (empty)', 'details':'Failed to Retrieve Data (service)', 'error':err}
    }
}


const ReadDB = async(Model, query, include)=>{
    try{
        let data = await Model.find(query, include);

        if(!data){
            return {'status':'failed', 'details':'Failed to Retrieve (service)'}
        }
        data = data[0]
        return {'status':'success', 'details':'data Retrieved successfully (service)', data}
    }
    catch(err){
        return {'status':'error', 'details':'Failed to Retrieve (service)', 'error':err}
    }
}


const PostDB = async(Model, body)=>{
    try{
        let data = await Model.create(body)

        if(!data){
            return {'status':'failed', 'details':'Failed to Post data (service)'}
        }
        return {'status':'success', 'details':'data Posted successfully (service)', data}
    }
    catch(err){
        return {'status':'failed', 'details':'Failed to Create (service)', 'error':err}
    }
}


const UpdateDB = async(Model, id, body)=>{
    try{
        let data = await Model.findByIdAndUpdate(id, body, {new:true})
        
        if(!data){
            return {'status':'failed', 'details':'Failed to Update data (service)1'}
        }
        return {'status':'success', 'details':'data Updated successfully (service)', data}
    }
    catch(err){
        return {'status':'failed', 'details':'Failed to Update (service)2', 'error':err}
    }
}


const DeleteDB = async(Model, id)=>{
    try{
        let data = await Model.findByIdAndDelete(id, {rawResult:true})

        if(!data){
            return {'status':'failed', 'details':'Failed to Delete data (service)'}
        }
        return {'status':'success', 'details':'data Deleted successfully (service)', data}
    }
    catch(err){
        return {'status':'failed', 'details':'Failed to Delete (service)', 'error':err}
    }
}


module.exports = { ReadDB, PostDB, UpdateDB, DeleteDB, ReadDB_tasks }