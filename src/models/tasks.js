const _mongoose = require('mongoose');

const _tasksSchema = new _mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true,
    },
    completed:{
        type: Boolean,
        default: false
    },
    owner:{
        type: _mongoose.Schema.Types.ObjectId,
        required: true
    }
},{
    timestamps: true
});

_tasksSchema.pre('save', async function(next){
    const _task = this;

    next();
})

const _tasks = _mongoose.model('Tasks',_tasksSchema);

module.exports = _tasks;