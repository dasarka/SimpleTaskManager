const _mongoose = require('mongoose');

const _tasksSchema = new _mongoose.Schema({
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
    },
    owner:{
        type: _mongoose.Schema.Types.ObjectId,
        required: true
    }
});

_tasksSchema.pre('save', async function(next){
    const _task = this;

    next();
})

const _tasks = _mongoose.model('Tasks',_tasksSchema);

module.exports = _tasks;