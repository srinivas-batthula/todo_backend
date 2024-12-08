const Model = require('../models/UserModel')
const CRUD = require('./CRUD')
const JWT = require('./JWT')


const CreateAndRetrieve = async(body)=>{
    try{
        let token_body = {'email':body.email, 'password':body.password}
        const res = await JWT.CreateToken(token_body)

        if(res.status==='success'){
            return {'status':'success', 'token':res.token}
        }
        else{
            return {'status':'failed', 'error':'Failed to Create Token (service)'}
        }
    }
    catch(err){
        return {'status':'failed', 'error':err}
    }
}

const Register = async(body)=>{
    try{
        const res = await CRUD.ReadDB(Model, {email:body.email}, {_id:1, username:1, email:1, password:1})
        if(res.status==='success'){
            return {'status':'failed (exists)', 'details':'User already exists in DB (service)', 'data':res.data}
        }
    }
    catch(err){
        return {'status':'failed', 'details':'Failed to Retrieve from DB (service)', 'error':err}

    }

    try{
        const res = await CRUD.PostDB(Model, body)
        if(res.status==='success'){
            try{
                const response = await CreateAndRetrieve(body)      //Final successful step
                return response
            }
            catch(err){
                return {'status':'failed', 'details':'Token Creation Failed (service)', 'error':err}
            }
        }
        else{
            console.log("e")
            return {'status':'failed', 'details':'Failed to create New User (service)'}
        }
    }
    catch(err){
        return {'status':'failed', 'details':'Failed to Register (service)', 'error':err}
    }
}

const Login = async(body)=>{
    try{
        const res = await CRUD.ReadDB(Model, {email:body.email}, {_id:1, username:1, email:1, password:1})
        if(res.status==='failed'){
            return {'status':'failed (not)', 'details':'User Not Found in DB (service)'}
        }
        else{
            const data = res.data
            if(data.password === body.password){
                const response = await CreateAndRetrieve(body)      //Final successful step
                return response
            }
            else{
                return {'status':'failed', 'details':'Password Not Matched (service)'}
            }
        }
    }
    catch(err){
        return {'status':'failed', 'details':'Failed to Validate the User (service)', 'error':err}
    }
}


module.exports = { Register, Login }