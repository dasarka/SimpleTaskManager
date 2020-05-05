const _mongoose = require('mongoose');
const _validators = require('validator');

const _users = _mongoose.model('Users', {
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
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
    }
});

module.exports = _users;