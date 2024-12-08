const Auth = require('../services/Authenticate')
const Model = require('../models/UserModel')
const CRUD = require('../services/CRUD')
const JWT = require('../services/JWT')


const Auth_Middleware = async(req, res, next) => {
    if(!req.cookies){
        return res.status(401).json({'status': 'failed', 'Auth':false, 'details': "Cookies/Token Not Found"})
    }
    else{
        // console.log(req.cookies)
        try {
            const response = await JWT.VerifyToken(req.cookies.jwt)       //Verifying Token
            if (response.status === 'success') {
                const u = await CRUD.ReadDB(Model, { email: response.data.email }, {_id:1, username:1, email:1, password:1})
                if (u.status === 'failed') {
                    return res.status(403).json({ 'status': 'failed', 'Auth':false, 'details': "User Not Found" });
                }
                else {
                    if ((u.data.password === response.data.password)) {     //Success
                        req.user = {
                            'username':u.data.username,
                            'userId':u.data._id,
                            'email':u.data.email
                        };
                        console.log("Authorized")   //Passing to next middleware (endPoint)
                        next();
                    }
                    else{
                        return res.status(403).json({'status': 'failed', 'Auth':false, 'details': "Password Not Matched"})
                    }
                }
            }
            else{
                return res.status(403).json({ 'status': 'failed', 'Auth':false, 'details': "Invalid Token" });
            }
        }
        catch (err) {
            return res.status(500).json({ 'status': 'failed', 'Auth':false, 'details': "Error while Verifying Token", 'error':err });
        }
    }
}

const Register = async(req, res)=>{
    const body = req.body
    if(body.username==='' || body.email==='' || body.password===''){
        return res.status(400).json({'status':'Bad Request', 'details':'Invalid Details'})
    }
    else{
        try{
            const response = await Auth.Register(body)
            if(response.status==='failed (exists)'){
                return res.status(400).json({'status':'Bad Request', 'details':'User already exists in our DataBase', 'data':response.data})
            }
            else if(response.status==='success'){                   //Success
                req.google=false

                res.cookie('jwt', response.token, {httpOnly: true, secure: process.env.MODE === 'production', expires: new Date(Date.now()+7*24*60*60*1000)})
                return res.status(201).json({'status':'success', 'details':"New User created"})
            }
            else{
                return res.status(500).json({'status':'failed', 'details':'Failed to create User'})
            }
        }
        catch(err){
            return res.status(500).json({'status':'failed', 'details':'Failed to create User', 'error':err})
        }
    }
}

const Login = async(req, res)=>{
    const body = req.body
    if(body.email==='' || body.password===''){
        return res.status(400).json({'status':'Bad Request', 'details':'Invalid Details'})
    }
    else{
        if(req.cookies.jwt){
            res.clearCookie('jwt', { path: '/' })
        }
        
        try{
            const response = await Auth.Login(body)
            if(response.status==='failed (not)'){
                return res.status(400).json({'status':'Bad Request', 'details':'User Not Found in our DataBase'})
            }
            else if(response.status==='success'){                   //Success
                req.google=false
                res.cookie('jwt', response.token, {httpOnly: true, secure: process.env.MODE+'' === 'production', expires: new Date(Date.now()+7*24*60*60*1000)})
                return res.status(201).json({'status':'success', 'details':"User Logged-In"})
            }
            else{
                return res.status(500).json({'status':'failed', 'details':'Internal Server error'})
            }
        }
        catch(err){
            return res.status(500).json({'status':'failed', 'details':'Failed to Fetch User', 'error':err})
        }
    }
}

const LogOut = (req, res)=>{
    try{
        res.clearCookie('jwt', { path: '/' })
        return res.status(200).json({'status':'success', 'details':"Cookie Cleared, Login again."})
    }
    catch(err){
        return res.status(500).json({'status':'fail', 'details':"No Cookie Found, Login again.", 'error':err})
    }
}



module.exports = { Auth_Middleware, Register, Login, LogOut }