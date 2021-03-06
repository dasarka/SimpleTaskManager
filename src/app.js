const express = require('express');
require('./db/mongoose');
const sessionRouter = require('./routers/session');
const profileRouter = require('./routers/profile');
const taskRouter = require('./routers/task');

const app = express();

app.use(express.json());

/**
 * without express middleware: new request -> run route handler
 * with express middleware: new request -> do something -> run route handler
 */

app.use(sessionRouter);
app.use(profileRouter);
app.use(taskRouter);


module.exports = app