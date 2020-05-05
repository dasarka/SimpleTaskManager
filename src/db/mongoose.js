const _mongoose = require('mongoose');
const _config = require('../config');

_mongoose.connect(_config.ConnectionUrl,{
    useNewUrlParser: true,
    useCreateIndex: true
});
