const webPush = require('web-push')
const nodeMailer = require('nodemailer')
const nodeSchedule = require('node-schedule')
const CRUD = require('./CRUD')
const UserModel = require('../models/UserModel')
const dotenv = require('dotenv').config({path:'./config.env'});


// const vapidKeys = webPush.generateVAPIDKeys();
// console.log('Public Key:', vapidKeys.publicKey);
// console.log('Private Key:', vapidKeys.privateKey);

const publicVapidKey = process.env.VAPID_PUBLIC_KEY + '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY + '';
webPush.setVapidDetails('mailto:srinivasb.temp@gmail.com', publicVapidKey, privateVapidKey);


const EMAIL_USER = process.env.EMAIL_USER+''                                          
const EMAIL_PASS = process.env.EMAIL_PASS+''                                          
const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER, // Sender's email
        pass: EMAIL_PASS, // Sender's email password or App password
    }
})


const Notify = async (options, choice) => {
    if (choice === 'delete') {
        const jobId = options._id
        const existingJob = nodeSchedule.scheduledJobs[jobId]
        if (existingJob) {
            existingJob.cancel()
        }
        return true
    }
    else if (choice === 'low') {
        return true
    }
    else if (choice === 'medium') {
        try{
            await Push(options)
            // console.log(nodeSchedule.scheduledJobs)
            return true
        }
        catch(err){
            console.log(err)
            return false
        }
    }
    else if (choice === 'high') {
        try{
            await Push(options)
            await Mail(options)
            // console.log(nodeSchedule.scheduledJobs)
            return true
        }
        catch(err){
            console.log(err)
            return false
        }
    }
    else {
        return false
    }
}

const Mail = async (data) => {
    const jobId = data._id
    // const existingJob = nodeSchedule.scheduledJobs[jobId]
    // if (existingJob) {
    //     existingJob.cancel()
    // }

    if (!data.dueDate || data.dueDate < new Date()) {
        console.log("Invalid dueDate. The scheduled time must be a future date.");
        return;
    }

    console.log("start schedule(email)--> due: "+data.dueDate)

    const mailOptions = {
        from: EMAIL_USER,
        to: data.email,
        subject: 'Task Due Alert!',
        html: `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { padding: 20px; }
                        .header { font-size: 24px; font-weight: bold; }
                        .content { font-size: 18px; }
                        .link { color: #1a73e8; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header" style="color:red">Task Due Alert!</div>
                        <div class="content">
                            <p>Hello User,</p>
                            <p>The following task is due:</p>
                            <p><strong>${data.task}</strong></p>
                            <p>To view more details or update your task, click the link below:</p>
                            <p><a target='_blank' href="https://srinivas-batthula.github.io/todo" class="link">View Task Details</a></p>
                        </div>
                        <p>Best regards, <br />Your Task Management System</p>
                    </div>
                </body>
            </html>`
    }

    nodeSchedule.scheduleJob(jobId, data.dueDate, async()=>{
        try {
            await transporter.sendMail(mailOptions)
            console.log({'status':'success' ,'details':'Email Sent'})
        }
        catch (err) {
            console.log({'status':'failed', 'details':'Email Not Sent', err})
        }
    })

    console.log("end schedule(email)")
}

const Push = async(data) => {
    const jobId = data._id
    const existingJob = nodeSchedule.scheduledJobs[jobId]
    if(existingJob){
        existingJob.cancel()
    }
    const notificationPayload = JSON.stringify({
        title: 'Task Due Alert!',
        body: data.task,
    });

    const res = await CRUD.ReadDB(UserModel, {_id: data.user_id}, {subscription:1})

    if(!res || res.status!=='success' || !res.data.subscription){
        console.log('Failed,, Allow Notifications to Send...')
        return;
    }

    console.log("start schedule(push)--> due: "+data.dueDate)

    nodeSchedule.scheduleJob(jobId, data.dueDate, async()=>{
        try {
            await webPush.sendNotification(res.data.subscription, notificationPayload)
            console.log({'status':'success' ,'details':'Notification Sent'})
        }
        catch (err) {
            console.log({'status':'failed', 'details':'Notification Not Sent', err})
        }
    })
    console.log("end schedule(push)")
}


module.exports = { Notify }
