const express = require('express');
require('./db/mongoose');

const Users = require('./models/users');
const Tasks = require('./models/tasks');

const app = express();
const port =process.env.PORT || 3000;

app.use(express.json());

app.post('/users',(req,res)=>{
    const user= new Users(req.body);

    user.save().then(()=>{
        res.status(201).send();
    }).catch((err)=>{
        res.status(400).send({error:err.message});
    })
});

app.get('/users',(_req,res) =>{
    Users.find({}).then((users)=>{
        res.status(200).send({response: users})
    }).catch(() =>{
        res.status(500).send();
    })
});

app.get('/users/:id',(req,res) =>{
    const id = req.params.id;
    Users.findById(id).then((user)=>{
        const status=user ? 200 : 404;
        res.status(status).send({response: user});
    }).catch((_err) =>{
        res.status(500).send();
    })
});

app.post('/tasks',(req,res)=>{
    const task= new Tasks(req.body);

    task.save().then(()=>{
        res.status(201).send();
    }).catch((err)=>{
        res.status(400).send({error:err.message})
    })
})

app.get('/tasks',(_req,res) =>{
    Tasks.find({}).then((task)=>{
        res.status(200).send({response: task})
    }).catch((_err) =>{
        res.status(500).send();
    })
});

app.get('/tasks/:title',(req,res) =>{
    const title = req.params.title;
    Tasks.findOne({title: title}).then((task)=>{
        const status=task ? 200 : 404;
        res.status(status).send({response: task});
    }).catch(() =>{
        res.status(500).send();
    })
});

app.get('/filter',(_req,res) =>{
    res.status(400).send();
});

app.get('/filter/tasks',(req,res) =>{
    Tasks.find(req.body).then((task)=>{
        const status=task ? 200 : 404;
        res.status(status).send({response: task});
    }).catch(() =>{
        res.status(500).send();
    })
});

app.listen(port, () =>{
    console.log('Server is up on '+ port);
})