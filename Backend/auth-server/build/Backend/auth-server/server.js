"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var bodyParser = __importStar(require("body-parser"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var mongoose_1 = __importDefault(require("mongoose"));
var axios_1 = __importDefault(require("axios"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var passport_1 = __importDefault(require("passport"));
var passport_jwt_1 = __importDefault(require("passport-jwt"));
var urls_const_1 = require("../../urls_const");
// ---------- MONGOOSE -----------------------------------
mongoose_1.default.connect(urls_const_1.url_mongo_auth + '/zchat-project-auth-1', { useNewUrlParser: true });
// process.env.MONGODB_URI ||
mongoose_1.default.set('useCreateIndex', true);
var Schema = mongoose_1.default.Schema;
var userSchema = new Schema({
    username: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    language: { type: String }
});
var User = mongoose_1.default.model('User', userSchema);
// --------- MONGOOSE END --------------------------------
// ----------- EXPRESS -------------------------------
// Create a new express application instance
var app = express_1.default();
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Authentication Service port 3000');
});
var publicPath = __dirname + '/public';
app.use(express_1.default.static(publicPath));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
var ExtractJwt = passport_jwt_1.default.ExtractJwt;
var JwtStrategy = passport_jwt_1.default.Strategy;
var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: 'mySecret'
};
var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);
    User.findOne({ username: jwt_payload.username, _id: jwt_payload._id })
        .then(function (user) {
        if (user) {
            next(null, user);
        }
        else {
            next(null, false);
        }
    })
        .catch(function () { return console.log('Payload Cacth'); });
});
passport_1.default.use(strategy);
app.use(passport_1.default.initialize());
// ------------ JWT END -------------------------------------
// ------------ ROUTING ------------------------------------
app.post('/login', function (req, res) {
    var name = req.body.username;
    var pass = req.body.password;
    User.findOne({ username: name })
        .then(function (user) {
        if (user) {
            bcrypt_1.default.compare(pass, user.password, function (err, result) {
                if (err) {
                    res.send({ msg: 'Error Try Again' });
                }
                else {
                    if (result) {
                        var payload = { username: user.username, _id: user._id };
                        var token = jsonwebtoken_1.default.sign(payload, jwtOptions.secretOrKey, { expiresIn: '36000s' });
                        res.send({ token: token, username: user.username, language: user.language });
                    }
                    else {
                        res.send({ msg: 'Wrong password' });
                    }
                }
            });
        }
        else {
            res.send({ msg: 'User does not exist' });
        }
    }).catch(function (e) {
        console.log('Login Catch');
    });
});
app.post('/register', function (req, res) {
    var name = req.body.username;
    var pass = req.body.password;
    console.log(req.body);
    User.findOne({ username: name })
        .then(function (user) {
        if (user) {
            res.send({ msg: 'Username already exists', flag: false });
        }
        else {
            bcrypt_1.default.genSalt(10, function (err, salt) {
                bcrypt_1.default.hash(pass, salt, function (error, hashedPass) {
                    var user1 = new User({
                        username: name,
                        password: hashedPass,
                        language: req.body.customLanguage
                    });
                    user1.save()
                        .then(function () {
                        res.send({ msg: 'Registration Successfully', flag: true });
                    })
                        .then(function () {
                        User.findOne({ username: user1.username })
                            .then(function (u) {
                            var temp = { _id: u._id, username: u.username };
                            console.log(temp);
                            axios_1.default.post(urls_const_1.url_noty + '/save-user', temp)
                                .then(function (response) { console.log(response.data); })
                                .catch(function (e) { return console.log('Axios Catch', e); });
                        });
                    })
                        .catch(function () {
                        console.log('Find user to copy CATCH');
                        res.send('Error registration nested');
                    });
                });
            });
        }
    })
        .catch(function (e) {
        console.log('Register catch');
        res.send('Error registration main');
    });
});
app.get('/secret', passport_1.default.authenticate('jwt', { session: false }), function (req, res) {
    console.log('Secret Accessed');
    res.send({ message: "Success! You can not see this without a token" });
});
app.get('/check-auth', passport_1.default.authenticate('jwt', { session: false }), function (req, res) {
    console.log('Authorization Accessed');
    res.send({ 'authorization': true });
});
app.post('/change-password', function (req, res) {
    console.log('Change Password', req.body);
    var name = req.body.username;
    var pass = req.body.old_password;
    var new_pass = req.body.password;
    User.findOne({ username: name })
        .then(function (user) {
        if (user) {
            bcrypt_1.default.compare(pass, user.password, function (err, result) {
                if (err) {
                    res.send({ msg: 'Error Try Again' });
                }
                else {
                    if (result) {
                        bcrypt_1.default.genSalt(10, function (error, salt) {
                            bcrypt_1.default.hash(new_pass, salt, function (error2, hashedPass) {
                                User.findOneAndUpdate({ _id: user._id }, { $set: { 'password': hashedPass } })
                                    .then(function (u) {
                                    // console.log(u, 'test');
                                    res.send({ msg: 'Change Successfully' });
                                });
                            });
                        });
                    }
                    else {
                        res.send({ msg: 'Wrong password' });
                    }
                }
            });
        }
        else {
            res.send({ msg: 'User does not exist' });
        }
    }).catch(function (e) {
        console.log('Login Catch');
    });
});
app.post('/change-language', function (req, res) {
    console.log('Language', req.body);
    if (req.body.username) {
        User.findOneAndUpdate({ username: req.body.username }, { $set: { 'language': req.body.customLanguage } })
            .then(function (u) {
            res.send({ msg: 'Change Successfully', lang: req.body.customLanguage });
        })
            .catch(function (e) {
            console.log('Change language Catch');
        });
    }
    else {
        res.send({ msg: 'Error' });
    }
});
app.get('/x', function (req, res) {
    res.send({ msg: 'Hello Auth' });
});
