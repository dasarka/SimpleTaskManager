const express = require('express');
const Users = require('../models/users');
const _auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const emailAccount = require('../emails/account');

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
        emailAccount.sendCancellationEmail(req.session.user.email,req.session.user.name);
        res.send();
    }catch{
        res.status(500).send();
    }
});

//avatar
const _upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            return cb(new Error('Please upload an image'));
        }

        cb(undefined,true);
    }
});

router.post('/users/me/avatar',_auth,_upload.single('avatar'), async (req,res) =>{
    const _buffer = await sharp(req.file.buffer).resize({
        width:50,
        height:50
    }).png().toBuffer();
    req.session.user.avatar = _buffer;
    await req.session.user.save();
    res.send();
},(error,req,res,next)=>{
    res.status(400).send({error: error.message});
})

router.delete('/users/me/avatar',_auth, async (req,res) =>{
    try{
        req.session.user.avatar = undefined;
        await req.session.user.save();
        res.send();
    }catch{
        res.status(500).send();
    }
});

//http://localhost:3000/users/5eba7bff83a56b2010c9c9f3/avatar
router.get('/users/:id/avatar', async(req,res) =>{
    try{
        console.log('get')
        const user = await Users.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error();
        }

        res.set('Content-Type','image/png');
        res.send(user.avatar);

    }catch{
        res.status(404).send('Oops!!! No avatar found')
    }
})

module.exports = router;