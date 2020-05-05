const _mongoose = require('mongoose');

const _tasks = _mongoose.model('Tasks',{
    title:{
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true,
    },
    completed:{
        type: Boolean,
        default: false
    },
    createdOn:{
        type: Date,
        default: new Date()
    }
});

module.exports = _tasks;