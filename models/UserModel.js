const mongoose = require("mongoose")


const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    subscription:{
        endpoint:{
            type:String
        },
        keys:{
            p256dh:{
                type:String
            },
            auth:{
                type:String
            }
        }
    }
}, { timestamps:true })

const UserModel = mongoose.model('users_todo', UserSchema)


module.exports = UserModel