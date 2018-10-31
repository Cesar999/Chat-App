import express from 'express';
import * as bodyParser from "body-parser";

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import axios from "axios";
import jwt from "jsonwebtoken";
import passport from "passport";
import passportJWT from 'passport-jwt';

// ---------- MONGOOSE -----------------------------------
mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost/zchat-project-auth-1',{ useNewUrlParser: true });

mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, require: true, unique: true},
    password: {type: String, require: true }
});

const User = mongoose.model('User',userSchema);

// --------- MONGOOSE END --------------------------------


// ----------- EXPRESS -------------------------------
// Create a new express application instance
const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log('Authentication Service port 3000')
  });

let publicPath = __dirname+'/public';
app.use(express.static(publicPath));
app.use(bodyParser.json());

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization');
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });

// ----------- EXPRESS END -------------------------------

//------------ JWT -------------------------------------
interface JwtObj {
    jwtFromRequest: any;
    secretOrKey: string;
}

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions: JwtObj = {
    jwtFromRequest:ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: 'mySecret'
};

const strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log('payload received', jwt_payload);
  
    User.findOne({username: jwt_payload.username, _id:jwt_payload._id})
    .then((user)=>{
        if (user) {
            next(null, user);
          } else {
            next(null, false);
          }
    })
    .catch(()=>console.log('Payload Cacth'));
  });
  
  passport.use(strategy);
  app.use(passport.initialize());

//------------ JWT END -------------------------------------

//------------ ROUTING ------------------------------------
app.post('/login', (req, res) => {
    let name = req.body.username;
    let pass = req.body.password;
    User.findOne({username: name})
    .then((user: any)=>{
        if(user){
            bcrypt.compare(pass, user.password, (err, result)=>{
                if(err){
                    res.send({msg:'Error Try Again'});
                }else{
                    if(result){
                        let payload = {username: user.username, _id:user._id};
                        let token = jwt.sign(payload, jwtOptions.secretOrKey,  {expiresIn: '36000s'});
                        res.send({token, username: user.username });
                    }else{
                        res.send({msg:'Wrong password'});
                    }
                }
            });
        }
        else{
            res.send({msg:'User does not exist'});
        }
    }).catch((e)=>{
      console.log('Login Catch');
    });
  });

  app.post('/register', (req, res) => {
    let name = req.body.username;
    let pass = req.body.password;
    console.log(name, pass);
    User.findOne({username: name})
    .then((user)=>{
        if(user){
            res.send({msg: 'Username already exists', flag: false});
        }
        else{
            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(pass, salt, (err, hashedPass)=>{
                    const user1: any = new User({
                        username: name,
                        password:  hashedPass});
                    user1.save()
                    .then(()=>{
                        res.send({msg: 'Registration Succesfully', flag: true});
                    })
                    .then(()=>{
                        User.findOne({username: user1.username})
                        .then((user:any)=>{
                            let temp ={_id: user._id, username: user.username};
                            console.log(temp);
                            axios.post('http://localhost:3001/save-user', temp)
                            .then((response:any)=>{console.log(response.data);})
                            .catch(()=>console.log('Axios Catch'));
                        })
                    })
                    .catch(()=>{console.log('Find user to copy CATCH')});
                  });
              });
          }
    })
    .catch((e)=>{
      console.log('Register catch');
    });
  
  });

app.get("/secret", passport.authenticate('jwt',{session:false}),(req,res)=>{
    console.log('Secret Accessed');
  res.send({message: `Success! You can not see this without a token`});
});

app.get('/check-auth', passport.authenticate('jwt', { session: false }), function(req,res){
    console.log('Authorization Accessed');
    res.send({'authorization': true});
});
  