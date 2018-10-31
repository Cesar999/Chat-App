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
// ---------- MONGOOSE -----------------------------------
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost/zchat-project-auth-1', { useNewUrlParser: true });
mongoose_1.default.set('useCreateIndex', true);
var Schema = mongoose_1.default.Schema;
var userSchema = new Schema({
    username: { type: String, require: true, unique: true },
    password: { type: String, require: true }
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
                        res.send({ token: token, username: user.username });
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
    console.log(name, pass);
    User.findOne({ username: name })
        .then(function (user) {
        if (user) {
            res.send({ msg: 'Username already exists', flag: false });
        }
        else {
            bcrypt_1.default.genSalt(10, function (err, salt) {
                bcrypt_1.default.hash(pass, salt, function (err, hashedPass) {
                    var user1 = new User({
                        username: name,
                        password: hashedPass
                    });
                    user1.save()
                        .then(function () {
                        res.send({ msg: 'Registration Succesfully', flag: true });
                    })
                        .then(function () {
                        User.findOne({ username: user1.username })
                            .then(function (user) {
                            var temp = { _id: user._id, username: user.username };
                            console.log(temp);
                            axios_1.default.post('http://localhost:3001/save-user', temp)
                                .then(function (response) { console.log(response.data); })
                                .catch(function () { return console.log('Axios Catch'); });
                        });
                    })
                        .catch(function () { console.log('Find user to copy CATCH'); });
                });
            });
        }
    })
        .catch(function (e) {
        console.log('Register catch');
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
