const express = require('express');
require('./db/mongoose');
const sessionRouter = require('./routers/session');
const profileRouter = require('./routers/profile');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

/**
 * without express middleware: new request -> run route handler
 * with express middleware: new request -> do something -> run route handler
 */

// app.use((req,res,next) =>{
//     res.status(503).send('TaskManager API site is currently under maintainance. Check back soon!!!');
// });
app.use(sessionRouter);
app.use(profileRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is up on ' + port);
})