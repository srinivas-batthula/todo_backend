const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config({path:'./config.env'});

const JWT_SECRET = process.env.JWT_SECRET+''


const CreateToken = async(body)=>{
    try{
        const token = await jwt.sign(body, JWT_SECRET, { expiresIn:'7d' })
        if(token){
            return {'status':'success', token}
        }
        else{
            return {'status':'failed'}
        }
    }
    catch(err){
        console.log(err)
        return {'status':'failed', err}
    }
}

const VerifyToken = async(token)=>{
    try{
        const data = await jwt.verify(token, JWT_SECRET)
        if(data){
            return {'status':'success', data}
        }
        else{
            return {'status':'failed'}
        }
    }
    catch(err){
        console.log(err)
        return {'status':'failed', err}
    }
}


module.exports = { CreateToken, VerifyToken }