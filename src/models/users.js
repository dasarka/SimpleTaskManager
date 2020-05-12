const _mongoose = require('mongoose');
const _validators = require('validator');
const _bCrypt = require('bcrypt');
const _jwt = require('jsonwebtoken');
const Task = require('./tasks');

const _usersSchema = new _mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowerCase: true,
        validate(value) {
            if (!_validators.isEmail(value)) {
                throw new Error('Please provide correct email');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        min: 18
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().indexOf('password') > -1) {
                throw new Error('Password should not contain <password>');
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps:true
});

//virtual- in sql , kust like view
_usersSchema.virtual('tasks',{
    ref: 'Tasks',
    localField:'_id',
    foreignField:'owner'
})

//methods are bind on instances
//toJSON - standard method to update response
_usersSchema.methods.toJSON = function (){
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;
    delete userObj.__v;
    delete userObj.avatar;

    return userObj;

}

_usersSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = _jwt.sign({_id: user._id.toString()},process.env.AUTH_TOKEN_KEY);
    
    user.tokens=user.tokens.concat({token});
    await user.save();

    return token;
}

//static methods are bind on model, access global
_usersSchema.statics.findByCredentials = async (email, password) => {
    const user = await _users.findOne({
        email
    });
    if (!user) {
        throw new Error('searchkey:'+email+',error: email not found');
    }

    const isMatch = await _bCrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('searchkey:'+email+',error: invalid password');
    }

    return user;
};


//hash plain text password before saving
_usersSchema.pre('save', async function(next){
    const _user = this;
    if(_user.isModified('password')){
        _user.password = await _bCrypt.hash(_user.password,8);
    }
    next();
});

//delete task once user is remove
_usersSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
})


const _users = _mongoose.model('Users',_usersSchema );

module.exports = _users;