const mongoose = require('mongoose');


const TaskSchema = new mongoose.Schema({        //Only 'task' & 'user_id' are Required field
    task:{
        type:String,
        required:true,
        unique:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users_todo',
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'completed', 'delayed'],       //'delayed' -dueDate time is exceeded
        default:'pending'
    },
    category:{
        type:String,
        enum: ['personal', 'work', 'other'],
        default:'other'
    },
    priority:{
        type:String,
        enum: ['low', 'medium', 'high'],
        default:'medium'
    },
    dueDate:{
        type:Date
    }
    
}, { timestamps:true })

// Create a TTL index on the `createdAt` field to delete documents 3 days after creation
TaskSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });  // 3 days = 259200 seconds

const TaskModel = mongoose.model('tasks_todo', TaskSchema);


module.exports = TaskModel;