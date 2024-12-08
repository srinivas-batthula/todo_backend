const Model = require('./../models/TaskModel')
const CRUD = require('../services/CRUD')
const Notification = require('../services/Notification')


const getAllTasks = async(req, res)=>{
    try{
        let response = await CRUD.ReadDB_tasks(Model, req.user.userId)
        response.user = {                  //Returns User-details to client
            "username":req.user.username,
            'user_id':req.user.userId,
            'email':req.user.email
        }

        if(response.status==='success'){
            return res.status(200).json(response)
        }
        else if(response.status==='failed (empty)'){
            return res.status(200).json({'status':'success (empty)', 'details':'There are No Lists to Fetch', 'user':response.user})
        }
        else{
            return res.status(500).json(response)
        }
    }
    catch(err){
        return res.status(500).json({'status':'failed', 'details':'Failed to Retrieve Data', 'error':err})
    }
}

const postTask = async(req, res)=>{
    let body = req.body
    if(!body.task){
        return res.status(400).json({'status':'Bad Request', 'details':'Invalid Data', 'error':'Failed to Create'})
    }
    body.user_id = req.user.userId
    
    if(body.dueDate){                           //Task Scheduling
    // let dateFromFrontend = " 17/11/2024T05:30 "            //Time is given in IST(Indian) format
    const [date, time] = (body.dueDate).split('T')
    const [day, month, year] = date.split('/')
    const [hrs, mins] = time.split(':')
    let ISTDate = new Date(Date.UTC(year, month-1, day, hrs, mins))
    ISTDate.setUTCMinutes(ISTDate.getUTCMinutes() - (5*60 + 30))
    // ISTDate = ISTDate.toISOString()
    // console.log(ISTDate)
    body.dueDate = ISTDate
    }
    try{
        let response = await CRUD.PostDB(Model, body)
        if(response.status==='success'){
            // const resp = await CRUD.ReadDB(Model, {email: body.email}, {_id: 1, priority: 1})
            if(body.dueDate){
                let options = {
                    _id: response.data._id+'',
                    user_id: body.user_id,
                    dueDate: response.data.dueDate,
                    email: req.user.email,
                    task: response.data.task
                }
                const r = await Notification.Notify(options, response.data.priority)
                console.log(r)
            }
            res.status(201).json(response)
        }
        else{
            res.status(500).json(response)
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({'status':'failed', 'details':'Failed to Create', 'error':err})
    }
}

const patchTask = async(req, res)=>{
    if(!req.body || !req.query.id){
        return res.status(400).json({'status':'Bad Request', 'details':'Invalid Data', 'error':'Failed to Update'})
    }
    let body = req.body
    let id = req.query.id
    // console.log(body)

    if(body.dueDate){                           //Task Scheduling
    // let dateFromFrontend = "17/11/2024T13:11"    (IST-format)
    const [date, time] = (body.dueDate).split('T')
    const [day, month, year] = date.split('/')
    const [hrs, mins] = time.split(':')
    let ISTDate = new Date(Date.UTC(year, month-1, day, hrs, mins))
    ISTDate.setUTCMinutes(ISTDate.getUTCMinutes() - (5*60 + 30))
    // ISTDate = ISTDate.toISOString()
    // console.log('ISTDate: '+ISTDate)        //"2024-11-17T07:41:00.000Z"(Global-format)
    body.dueDate = ISTDate
    }
    try{
        let response = await CRUD.UpdateDB(Model, id, body)

        if(response.status==='success'){
            if(body.dueDate || body.priority){
                let options = {
                    _id: id,
                    user_id: req.user.userId,
                    dueDate: response.data.dueDate,
                    email: req.user.email+'',
                    task: response.data.task
                }
                const r = await Notification.Notify(options, response.data.priority)
                console.log(r)
            }
            res.status(200).json(response)
        }
        else{
            res.status(500).json(response)
        }
    }
    catch(err){
        res.status(500).json({'status':'failed', 'details':'Failed to Update', 'error':err})
    }
}

const deleteTask = async(req, res)=>{
    if(!req.query.id){
        return res.status(400).json({'status':'Bad Request', 'details':'Invalid Data', 'error':'Failed to Delete'})
    }

    let id = req.query.id
    try{
        let response = await CRUD.DeleteDB(Model, id)

        if(response.status==='success'){
            const r = await Notification.Notify({_id: id}, 'delete')
            console.log(r)

            res.status(200).json(response)
        }
        else{
            res.status(404).json(response)
        }
    }
    catch(err){
        res.status(500).json({'status':'failed', 'details':'Failed to Delete', 'error':err})
    }
}


module.exports = { getAllTasks, postTask, patchTask, deleteTask };