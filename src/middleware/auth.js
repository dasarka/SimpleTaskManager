const _jwt = require('jsonwebtoken');
const Users = require('../models/users');

const _auth = async (req,res,next) =>{
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = _jwt.verify(token,process.env.AUTH_TOKEN_KEY);

        const user = await Users.findOne({_id:decoded._id,'tokens.token':token});
        if(!user){
            throw new Error();
        }else{
            req.session = {user,token};
            next();
        }
    }catch{
        res.status(401).send({error: 'Authorization failure'});
    }
    
}

module.exports = _auth;