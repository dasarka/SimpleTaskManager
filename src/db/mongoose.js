const _mongoose = require('mongoose');

_mongoose.connect(process.env.DB_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
