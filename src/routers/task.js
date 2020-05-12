const express = require('express');
const Tasks = require('../models/tasks');
const _auth = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks',_auth, async (req, res) => {
    const task = new Tasks({
        ...req.body,
        ...{owner: req.session.user._id}
    });

    try {
        await task.save();
        res.status(201).send();
    } catch (err) {
        res.status(400).send(err);
    }
})

///tasks?completed=false
//tasks?limit=10
///tasks?limit=2&pageNo=1
router.get('/tasks', _auth,async (req, res) => {
    const match ={};

    if(req.query.completed){
        match.completed = req.query.completed == 'true';
    }

    try {
        await req.session.user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: (parseInt(req.query.pageNo)*parseInt(req.query.limit)),
                sort:{
                    createdAt: -1 //for desc it's -1, for asc it's 1
                }
            }
        }).execPopulate();
        res.send(req.session.user.tasks)
    } catch {
        res.status(500).send();
    }
});

router.get('/tasks/:id', _auth,async (req, res) => {
    try {
        const task = await Tasks.findOne({
            _id: req.params.id,
            owner: req.session.user._id
        });
        res.send({task});
    } catch {
        res.status(500).send();
    }
});

router.patch('/tasks/:id',_auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdate = ["description", "completed"];
    const isValidOperation = updates.every(item => allowUpdate.includes(item));

    if (!isValidOperation) {
        return res.status(400).send({
            error: "Invalid updates!!!"
        });
    }
    try {
        const task = await Tasks.findOne({
            _id: req.params.id,
            completed: false,
            owner: req.session.user._id
        });
        if(!task){
            res.status(404).send();
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save({validateBeforeSave: true});

        res.send({ task});
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete('/tasks/:id', _auth,async(req,res) =>{
    try{
        const task = await Tasks.findOneAndRemove({_id: req.params.id,owner: req.session.user._id});
        res.status(task ? 200 : 404).send();
    }catch{
        res.status(500).send();
    }
});

module.exports = router;