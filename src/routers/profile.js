const express = require('express');
const Users = require('../models/users');
const _auth = require('../middleware/auth');

const router = new express.Router();

//profile
router.get('/users/me',_auth,async (req,res) =>{
    res.send(req.session.user);
})


router.patch('/users/me',_auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdate = ["name", "age", "password"];
    const isValidOperation = updates.every(item => allowUpdate.includes(item));

    if (!isValidOperation) {
        return res.status(400).send({
            error: "Invalid updates!!!"
        });
    }
    try {
        const {user} = req.session;

        updates.forEach(update => user[update] = req.body[update]);
        await user.save({validateBeforeSave: true});

        res.send({user});
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete('/users/me',_auth, async(req,res) =>{
    try{
        await req.session.user.remove();
        res.send();
    }catch{
        res.status(500).send();
    }
});

module.exports = router;