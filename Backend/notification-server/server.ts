import express from 'express';
import * as bodyParser from 'body-parser';
import mongoose from 'mongoose';
import axios from 'axios';
import socket from 'socket.io';

// START MONGOOSE---------------------------------------
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/zchat-project-notification-1', { useNewUrlParser: true });

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String},
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    conversations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
      }],
});

const messageSchema = new Schema({
    content: {type: String},
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
      },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
});

const conversationSchema = new Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      }],
});

interface IUser extends mongoose.Document {
    username: string;
    contacts?: Array<mongoose.Types.ObjectId>;
    conversations?: Array<mongoose.Types.ObjectId>;
}

const User = mongoose.model<IUser>('User', userSchema, 'User');
const Message = mongoose.model('Message', messageSchema, 'Message');
const Conversation = mongoose.model('Conversation', conversationSchema, 'Conversation');

mongoose.set('useFindAndModify', false);
// END MONGOOSE---------------------------------------

// START EXPRESS-----------------------------------
const app = express();
const port = process.env.PORT || 3001;
app.use(bodyParser.json());

const server = app.listen(port, () => {
    console.log(`Notification Service port 3001`);
});

const publicPath = __dirname + '/public';
app.use(express.static(publicPath));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });

  // ---------------------------------------

  app.get('/check-auth', function(req, res) {
    console.log(req.headers.authorization);
    const config = {
        headers: {
            authorization: req.headers.authorization,
        }
      };
    axios.get('http://localhost:3000/check-auth', config)
    .then(function (response) {
        console.log(response.data);
        res.send(response.data);
    })
    .catch((e) => {
        console.log(e.response.data);
        res.send('Unauthorized');
    });
});
// -------------------------------------------

app.post('/save-user', function(req, res) {
    console.log(req.body);
    const user1 = new User({...req.body});
    user1.save()
    .then((u) => {
        console.log(u);
    })
    .catch((e) => {
        console.log(e);
    });
});

// ------------------------------

app.post('/add-contact', function(req, res) {
    console.log(req.body);
    const contact = {username: req.body.contact};
    const mainUser = {username: req.body.mainUser};
    User.findOne(contact)
    .then((user) => {
        if (user) {
            addContactDB(mainUser, contact)
            .then((obj_user) => {
                addContactDB(contact, mainUser)
                .then((obj_contact) => {
                    if (obj_user.msg === `User saved`) {
                        createConversation(obj_user._id, obj_contact._id);
                        emitContacts(mainUser.username);
                        updateFriendContact(mainUser.username);
                    }
                    // console.log(obj_user.msg);
                    console.log('test');
                    res.send({msg: obj_user.msg});
                });
            });
        } else {
            res.send({msg: 'User does not exist'});
        }
    });

});

// -------------------------------------------------


app.post('/conversation-id', function(req, res) {
    console.log(req.body);
    const conv_id = req.body;
    Conversation.findById(conv_id)
    .then((c) => {
        res.send(c);
    });
});

// -------------------------------------------------

async function addContactDB(user: any, contact: any) {
    console.log(user, contact);

    const contact_id = await User.findOne(contact)
        .then((c) => {
            if (c) {
                console.log(c._id);
                return c._id;
            }
        });

    const contacts_arr = await User.findOne(user)
        .then((u) => {
            if (u) {
                console.log(u.contacts);
                return u.contacts;
            }
        });

    if (contacts_arr) {
        if (contacts_arr.indexOf(contact_id) === -1) {
            await contacts_arr.push(contact_id);
            await User.findOneAndUpdate(user, { $set: {'contacts': contacts_arr}}).then(c => console.log(c));
            console.log(contacts_arr);
            return await {msg: `User saved`, _id: contact_id};
        } else {
            return await {msg: `User already added`};
        }
    } else {
        return await {msg: `User does not exist`};
    }
}

function createConversation(user1_id: mongoose.Types.ObjectId, user2_id: mongoose.Types.ObjectId) {
    const conv = new Conversation({
        participants: [user1_id, user2_id],
            messages: [],
    });
    conv.save()
    .then((c) => {
        console.log('Conversation ', c);
    });
}

// ------------------------------------
interface ISocket extends SocketIO.Socket {
    nickname?: string;
}

const users: { [key: string]: ISocket} = {};

// START SOCKETS-----------------------------------
const io = socket(server);
// tslint:disable-next-line:no-shadowed-variable
io.sockets.on('connection', (socket: ISocket) => {

    socket.on('test', (data) => {
        console.log(socket.nickname, data);
    });

    socket.on('user online', (data: any) => {
        if (data.username !== undefined) {
            socket.nickname = data.username;
            users[socket.nickname] = socket;
            console.log(socket.nickname, Object.keys(users));
            emitContacts(socket.nickname);
            updateFriendContact(socket.nickname);
        }
    });

    socket.on('force disconnect', () => {
        console.log(socket.nickname);
        delete users[socket.nickname];
        updateFriendContact(socket.nickname);
    });

    socket.on('disconnect', () => {
        if (!socket.nickname) {
            return;
        }
        console.log(socket.nickname);
        delete users[socket.nickname];
        updateFriendContact(socket.nickname);
    });

});
// -------------END SOCKETS------------------

async function emitContacts(socket_nickname: string) {
    try {
        if (socket_nickname) {
            const list = await populateContacts(socket_nickname);
            // console.log(list);
            users[socket_nickname].emit('list contacts', list);
        }
    } catch (error) {
        console.log('error');
    }

}

async function populateContacts(data_username: string) {
    const list: any = [];

    await User.findOne({username: data_username})
    .populate({
        path: 'contacts',
        select: 'username _id'
    })
    .then(async (user: any) => {
        if (user) {
            let online = false;
            let obj: any;
            for (const c of user.contacts) {
                const conv_id = await getConversationId(user._id, c._id);
                if (users.hasOwnProperty(c.username)) {
                    online = true;
                } else {
                    online = false;
                }
                obj = {...c._doc, online, conv_id};
                console.log(obj);
                list.push(obj);
            }
            return list;
        }
    }).catch(c => console.log(c));

    return await list;
}

function updateFriendContact(nickname: string) {
    User.findOne({username: nickname})
    .populate(['contacts'])
    .then((user: any) => {
        for (const c of user.contacts) {
            if (Object.keys(users).indexOf(c.username) > -1) {
                // console.log(c.username);
                emitContacts(c.username);
            }
        }
    }).catch(c => console.log('updateFriendContact catch'));
}

async function getConversationId(user_id: any, contact_id: any) {
    const conv_id = await Conversation.findOne({participants: {$all: [user_id, contact_id]}})
    .then((c) => {
        console.log(c, 'fail');
        return c._id;
    });
    return await conv_id;
}
