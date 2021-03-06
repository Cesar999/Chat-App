"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var bodyParser = __importStar(require("body-parser"));
var mongoose_1 = __importDefault(require("mongoose"));
var axios_1 = __importDefault(require("axios"));
var socket_io_1 = __importDefault(require("socket.io"));
var urls_const_1 = require("../../urls_const");
// START MONGOOSE---------------------------------------
// mongoose.connect(url_mongo_notify + '/zchat-project-notification-1', { useNewUrlParser: true });
var connectWithRetry = function () {
    return mongoose_1.default.connect(urls_const_1.url_mongo_notify + '/zchat-project-notification-1', { useNewUrlParser: true }, function (err) {
        if (err) {
            console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
            setTimeout(connectWithRetry, 5000);
        }
    });
};
connectWithRetry();
// // process.env.MONGODB_URI ||
var Schema = mongoose_1.default.Schema;
var userSchema = new Schema({
    username: { type: String },
    contacts: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    conversations: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Conversation'
        }],
});
var messageSchema = new Schema({
    content: { type: String },
    conversation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: { type: String },
    seen: [{ username: String }]
});
var conversationSchema = new Schema({
    participants: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    messages: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Message'
        }],
    room: { type: String },
    seen: [{
            username: String
        }]
});
var User = mongoose_1.default.model('User', userSchema, 'User');
var Message = mongoose_1.default.model('Message', messageSchema, 'Message');
var Conversation = mongoose_1.default.model('Conversation', conversationSchema, 'Conversation');
mongoose_1.default.set('useFindAndModify', false);
// END MONGOOSE---------------------------------------
// START EXPRESS-----------------------------------
var app = express_1.default();
var port = process.env.PORT || 3001;
app.use(bodyParser.json());
var server = app.listen(port, function () {
    console.log("Notification Service port 3001");
});
var publicPath = __dirname + '/public';
app.use(express_1.default.static(publicPath));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
// ---------------------------------------
app.get('/check-auth', function (req, res) {
    // console.log(req.headers.authorization);
    var config = {
        headers: {
            authorization: req.headers.authorization,
        }
    };
    axios_1.default.get(urls_const_1.url_auth_be + '/check-auth', config)
        .then(function (response) {
        console.log(response.data, 'response data check auth');
        if (response.data.authorization) {
            res.send(response.data);
        }
        else {
            res.send('Data Undefined');
        }
    })
        .catch(function (e) {
        console.log('Check auth error');
        res.send('Unauthorized');
    });
});
// -------------------------------------------
app.post('/save-user', function (req, res) {
    console.log(req.body);
    var user1 = new User(__assign({}, req.body));
    user1.save()
        .then(function (u) {
        console.log(u);
    })
        .catch(function (e) {
        // console.log(e);
    });
});
// ------------------------------
app.post('/add-contact', function (req, res) {
    // console.log(req.body);
    var contact = { username: req.body.contact };
    var mainUser = { username: req.body.mainUser };
    User.findOne(contact)
        .then(function (user) {
        if (user) {
            addContactDB(mainUser, contact)
                .then(function (obj_user) {
                addContactDB(contact, mainUser)
                    .then(function (obj_contact) {
                    if (obj_user.msg === "User saved") {
                        createConversation(obj_user._id, obj_contact._id);
                        emitContacts(mainUser.username);
                        updateFriendContact(mainUser.username);
                    }
                    // console.log(obj_user.msg);
                    res.send({ msg: obj_user.msg });
                });
            });
        }
        else {
            res.send({ msg: 'User does not exist' });
        }
    });
});
app.post('/delete-contact', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var contact, mainUser, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contact = { username: req.body.contact };
                    mainUser = { username: req.body.mainUser };
                    // console.log(req.body);
                    return [4 /*yield*/, deleteContact(contact, mainUser)];
                case 1:
                    // console.log(req.body);
                    _a.sent();
                    return [4 /*yield*/, deleteContact(mainUser, contact)];
                case 2:
                    msg = _a.sent();
                    return [4 /*yield*/, emitContacts(mainUser.username)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, emitContacts(contact.username)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, res.send(msg)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
});
// -------------------------------------------------
app.post('/conversation-id', function (req, res) {
    // console.log(req.body);
    var conv_id = req.body;
    Conversation.findById(conv_id)
        .populate({
        path: 'messages',
        select: 'content author _id date room seen',
        populate: {
            path: 'author',
            select: 'username',
            model: 'User'
        }
    })
        .populate({
        path: 'participants',
        select: 'username'
    })
        .then(function (c) {
        res.send(c);
    });
});
// -------------------------------------------------
app.post('/create-room', function (req, res) {
    // console.log(req.body);
    User.findOne({ username: req.body.username })
        .then(function (u) {
        createRoomConversation(u._id, req.body.room);
    })
        .then(function () {
        res.send({ msg: 'Room created' });
    })
        .catch(function (e) { return console.log(e); });
});
app.post('/get-rooms', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var rooms;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findUserRooms(req.body)];
                case 1:
                    rooms = _a.sent();
                    return [4 /*yield*/, res.send(rooms)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
});
app.post('/leave-room', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var conv, user, index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Conversation.findById({ _id: req.body.conv_id })];
                case 1:
                    conv = _a.sent();
                    return [4 /*yield*/, User.findOne({ username: req.body.username })];
                case 2:
                    user = _a.sent();
                    index = conv.participants.indexOf(user._id);
                    conv.participants.splice(index, 1);
                    // console.log(conv.participants);
                    return [4 /*yield*/, Conversation.findOneAndUpdate({ _id: req.body.conv_id }, { $set: { 'participants': conv.participants } })];
                case 3:
                    // console.log(conv.participants);
                    _a.sent();
                    return [4 /*yield*/, res.send({ msg: 'left room' })];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
});
app.get('/x', function (req, res) {
    res.send({ msg: 'Hello Notify' });
});
// -------------------------------------------------
function deleteContact(contact, mainUser) {
    return __awaiter(this, void 0, void 0, function () {
        var contact_id, contacts_arr, index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User.findOne(contact)
                        .then(function (c) {
                        if (c) {
                            // console.log(c._id, 'DELETE');
                            return c._id;
                        }
                    })];
                case 1:
                    contact_id = _a.sent();
                    return [4 /*yield*/, User.findOne(mainUser)
                            .then(function (u) {
                            if (u) {
                                //  console.log(u.contacts, 'DELETE');
                                return u.contacts;
                            }
                        })];
                case 2:
                    contacts_arr = _a.sent();
                    if (!contacts_arr) return [3 /*break*/, 8];
                    if (!(contacts_arr.indexOf(contact_id) !== -1)) return [3 /*break*/, 6];
                    index = contacts_arr.indexOf(contact_id);
                    return [4 /*yield*/, contacts_arr.splice(index, 1)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, User.findOneAndUpdate(mainUser, { $set: { 'contacts': contacts_arr } }).then(function (c) { return console.log(c); })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, { msg: "User deleted" }];
                case 5: 
                // console.log(contacts_arr, 'DELETE');
                return [2 /*return*/, _a.sent()];
                case 6: return [4 /*yield*/, { msg: "User not found" }];
                case 7: return [2 /*return*/, _a.sent()];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function addContactDB(user, contact) {
    return __awaiter(this, void 0, void 0, function () {
        var contact_id, contacts_arr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User.findOne(contact)
                        .then(function (c) {
                        if (c) {
                            //  console.log(c._id);
                            return c._id;
                        }
                    })];
                case 1:
                    contact_id = _a.sent();
                    return [4 /*yield*/, User.findOne(user)
                            .then(function (u) {
                            if (u) {
                                //  console.log(u.contacts);
                                return u.contacts;
                            }
                        })];
                case 2:
                    contacts_arr = _a.sent();
                    if (!contacts_arr) return [3 /*break*/, 9];
                    if (!(contacts_arr.indexOf(contact_id) === -1)) return [3 /*break*/, 6];
                    return [4 /*yield*/, contacts_arr.push(contact_id)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, User.findOneAndUpdate(user, { $set: { 'contacts': contacts_arr } }).then(function (c) { return console.log(c); })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, { msg: "User saved", _id: contact_id }];
                case 5: 
                // console.log(contacts_arr);
                return [2 /*return*/, _a.sent()];
                case 6: return [4 /*yield*/, { msg: "User already added" }];
                case 7: return [2 /*return*/, _a.sent()];
                case 8: return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, { msg: "User does not exist" }];
                case 10: return [2 /*return*/, _a.sent()];
                case 11: return [2 /*return*/];
            }
        });
    });
}
function createConversation(user1_id, user2_id) {
    var conv = new Conversation({
        participants: [user1_id, user2_id],
        messages: [],
        room: null
    });
    conv.save()
        .then(function (c) {
        // console.log('Conversation ', c);
    });
}
function createRoomConversation(user1_id, room) {
    var conv = new Conversation({
        participants: [user1_id],
        messages: [],
        room: room
    });
    conv.save()
        .then(function (c) {
        // console.log('Conversation ', c);
    });
}
var users = {};
// START SOCKETS-----------------------------------
// server
var io = socket_io_1.default(server);
// tslint:disable-next-line:no-shadowed-variable
io.sockets.on('connection', function (socket) {
    socket.on('chat message', function (data) { return __awaiter(_this, void 0, void 0, function () {
        var message, obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storeMessage(data)];
                case 1:
                    message = _a.sent();
                    obj = __assign({}, data, { msg_id: message._id, seen: message.seen });
                    return [4 /*yield*/, returnConversation(obj, socket.nickname)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, updateFriendContact(socket.nickname)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on('user online', function (data) {
        if (data.username !== undefined) {
            socket.nickname = data.username;
            users[socket.nickname] = socket;
            console.log(socket.nickname, Object.keys(users));
            emitContacts(socket.nickname);
            updateFriendContact(socket.nickname);
        }
    });
    socket.on('force disconnect', function () {
        // console.log(socket.nickname);
        delete users[socket.nickname];
        updateFriendContact(socket.nickname);
    });
    socket.on('disconnect', function () {
        if (!socket.nickname) {
            return;
        }
        // console.log(socket.nickname);
        delete users[socket.nickname];
        updateFriendContact(socket.nickname);
    });
    socket.on('on-invite', function (data) { return __awaiter(_this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User.findOne({ username: data.invite })];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, Conversation.findById({ _id: data.toRoom })
                            .then(function (c) {
                            if (c.participants.indexOf(user._id) === -1) {
                                c.participants.push(user._id);
                                c.save();
                                if (users[data.invite]) {
                                    users[data.invite].emit('listen invited', { msg: 'invited' });
                                }
                                // console.log(data.invite);
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on('seen message', function (data) {
        if (data.room) {
            Message.findById({ _id: data.msg_id })
                .then(function (m) {
                return m.seen.filter(function (u) { return u.username !== data.user; });
            })
                .then(function (seen) {
                // console.log(seen);
                Message.findOneAndUpdate({ _id: data.msg_id }, { $set: { 'seen': seen } })
                    .then(function (m) {
                });
            });
        }
        else {
            Message.findOneAndUpdate({ _id: data.msg_id }, { $set: { 'seen': [] } })
                .then(function (m) {
                emitContacts(socket.nickname);
                updateFriendContact(socket.nickname);
            });
        }
    });
});
// -------------END SOCKETS------------------
function emitContacts(socket_nickname) {
    return __awaiter(this, void 0, void 0, function () {
        var list, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!socket_nickname) return [3 /*break*/, 2];
                    return [4 /*yield*/, populateContacts(socket_nickname)];
                case 1:
                    list = _a.sent();
                    // console.log(list);
                    users[socket_nickname].emit('list contacts', list);
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log(error_1, users, 'XXXXXXXXXXXXXXX');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function populateContacts(data_username) {
    return __awaiter(this, void 0, void 0, function () {
        var list;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    list = [];
                    return [4 /*yield*/, User.findOne({ username: data_username })
                            .populate({
                            path: 'contacts',
                            select: 'username _id'
                        })
                            .then(function (user) { return __awaiter(_this, void 0, void 0, function () {
                            var online, obj, _i, _a, c, conv, seen;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!user) return [3 /*break*/, 5];
                                        online = false;
                                        obj = void 0;
                                        _i = 0, _a = user.contacts;
                                        _b.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                                        c = _a[_i];
                                        return [4 /*yield*/, getConversationId(user._id, c._id)];
                                    case 2:
                                        conv = _b.sent();
                                        if (users.hasOwnProperty(c.username)) {
                                            online = true;
                                        }
                                        else {
                                            online = false;
                                        }
                                        seen = { seen: [] };
                                        if (conv !== null) {
                                            seen = conv.messages[conv.messages.length - 1];
                                        }
                                        obj = __assign({}, c._doc, { online: online, conv_id: conv._id, last_msg: seen });
                                        // console.log(obj);
                                        list.push(obj);
                                        _b.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/, list];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); }).catch(function (c) { return console.log(c); })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, list];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function updateFriendContact(nickname) {
    User.findOne({ username: nickname })
        .populate(['contacts'])
        .then(function (user) {
        for (var _i = 0, _a = user.contacts; _i < _a.length; _i++) {
            var c = _a[_i];
            if (Object.keys(users).indexOf(c.username) > -1) {
                // console.log(c.username);
                emitContacts(c.username);
            }
        }
    }).catch(function (c) { return console.log('updateFriendContact catch'); });
}
function getConversationId(user_id, contact_id) {
    return __awaiter(this, void 0, void 0, function () {
        var conv;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Conversation.findOne({ participants: { $all: [user_id, contact_id] }, room: null })
                        .populate({
                        path: 'messages',
                        select: 'content author _id date room seen',
                        populate: {
                            path: 'author',
                            select: 'username',
                            model: 'User'
                        }
                    })
                        .then(function (c) {
                        // console.log(c, 'fail');
                        return c;
                    })];
                case 1:
                    conv = _a.sent();
                    return [4 /*yield*/, conv];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function storeMessage(data) {
    return __awaiter(this, void 0, void 0, function () {
        var user, conv, msg, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User.findOne({ username: data.author })];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, Conversation.findById({ _id: data.conv_id })
                            .populate({ path: 'participants', select: 'username _id' })];
                case 2:
                    conv = _a.sent();
                    msg = new Message({
                        content: data.msg,
                        conversation: data.conv_id,
                        author: user._id,
                        date: data.date,
                        seen: conv.participants
                    });
                    return [4 /*yield*/, msg.save()];
                case 3:
                    message = _a.sent();
                    Conversation.findById({ _id: data.conv_id })
                        .then(function (c) {
                        c.messages.push(message._id);
                        c.save();
                    });
                    return [4 /*yield*/, message];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function returnConversation(data, socket_nickname) {
    users[socket_nickname].emit('chat conversation', data);
    if (data.to !== null) {
        users[data.to].emit('chat conversation', data);
    }
    else {
        Conversation.findById({ _id: data.conv_id })
            .populate({
            path: 'participants',
            select: 'username _id'
        })
            .then(function (c) {
            for (var _i = 0, _a = c.participants; _i < _a.length; _i++) {
                var u = _a[_i];
                users[u.username].emit('chat conversation', data);
            }
        });
    }
}
function findUserRooms(user) {
    return __awaiter(this, void 0, void 0, function () {
        var user_id, rooms;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user) return [3 /*break*/, 4];
                    return [4 /*yield*/, User.findOne(user)];
                case 1:
                    user_id = _a.sent();
                    return [4 /*yield*/, Conversation.find({ room: { $ne: null }, participants: { $in: [user_id._id] } })
                            .populate({
                            path: 'participants',
                            select: 'username'
                        })
                            .populate({
                            path: 'messages',
                            select: 'seen author _id',
                            populate: {
                                path: 'author',
                                select: 'username _id'
                            }
                        })];
                case 2:
                    rooms = _a.sent();
                    return [4 /*yield*/, rooms];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [4 /*yield*/, []];
                case 5: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
