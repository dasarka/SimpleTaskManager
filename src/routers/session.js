const express = require('express');
const Users = require('../models/users');
const _auth = require('../middleware/auth');
const emailAccount = require('../emails/account');

const router = new express.Router();

//registration
router.post('/signup', async (req, res) => {
    const user = new Users(req.body);

    try {
        await user.save();
        emailAccount.sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken();
        res.status(201).send({user,token});
    } catch (err) {
        res.status(400).send(err);
    }
});

//login
router.post('/login', async (req,res) =>{
    try{
        const user = await Users.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }catch(e){
        res.status(400).send({error: 'unable to login'});
    }
});

//logout
router.post('/logout',_auth,async(req,res) =>{
    try{
        const {user,token} = req.session;
        user.tokens = user.tokens.filter((tokens)=>{
            return tokens.token !== token;
        });

        await req.session.user.save();
        res.send();
    }catch{
        res.status(500).send();
    }
});

router.post('/logout/:device',_auth,async (req,res) =>{
    try{
        const {user,token} = req.session;
        if(req.params.device === 'all'){
            user.tokens = [];
        }else if(req.params.device === 'other'){
            user.tokens = user.tokens.filter((tokens)=>{
                return tokens.token === token;
            });
        }else{
            throw new Error();
        }

        await req.session.user.save();
        res.send();
    }catch{
        res.status(500).send();
    }
})

module.exports = router;