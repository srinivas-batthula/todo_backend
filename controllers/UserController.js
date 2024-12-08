const Model = require('./../models/UserModel')
const CRUD = require('../services/CRUD')


const UpdateUser = async(req, res)=>{
    const Id = req.user.userId
    if(!req.body){
        return res.status(400).json({'status':'Bad Request', 'details':'Invalid Data', 'error':'Failed to Update'})
    }
    const body = req.body
    let response
    try{
        response = await CRUD.UpdateDB(Model, Id, body)
        return res.status(201).json({'status':'success', 'data':response.data})
    }
    catch(err){
        return res.status(500).json({'status':'Failed', 'details':'Internal server error', 'error':err})
    }
}


module.exports = { UpdateUser }