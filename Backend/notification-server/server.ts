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
      },
    date: {type: String}
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
      room: {type: String}
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
        //console.log(u);
    })
    .catch((e) => {
       // console.log(e);
    });
});

// ------------------------------

app.post('/add-contact', function(req, res) {
    //console.log(req.body);
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
                    
                    res.send({msg: obj_user.msg});
                });
            });
        } else {
            res.send({msg: 'User does not exist'});
        }
    });

});


app.post('/delete-contact', async function(req, res) {
  const contact = {username: req.body.contact};
  const mainUser = {username: req.body.mainUser};
  //console.log(req.body);
  await deleteContact(contact, mainUser);
  const msg = await deleteContact(mainUser, contact);
  await emitContacts(mainUser.username);
  await emitContacts(contact.username);
  await res.send(msg);
});

// -------------------------------------------------


app.post('/conversation-id', function(req, res) {
    //console.log(req.body);
    const conv_id = req.body;
    Conversation.findById(conv_id)
    .populate({
      path: 'messages',
      select: 'content author _id date room',
      populate: {
        path: 'author',
        select: 'username',
        model: 'User'
      }
    })
    .populate({      
      path: 'participants',
      select: 'username'})
    .then((c) => {
        res.send(c);
    });
});

//-------------------------------------------------

app.post('/create-room', function(req, res) {
    //console.log(req.body);
    User.findOne({username: req.body.username})
    .then((u)=>{
        createRoomConversation(u._id, req.body.room);
    })
    .then(()=>{
        res.send({msg:'Room created'});
    })
    .catch((e)=>console.log(e))
});

app.post('/get-rooms', async function(req, res) {
    //console.log(req.body);
    const rooms = await findUserRooms(req.body);
    await res.send(rooms);
});

app.post('/invite-room', async function(req, res) {
    //console.log(req.body);
    const user = await User.findOne({username: req.body.invite});
    await Conversation.findById({_id: req.body.toRoom})
    .then((c: any) => {
    if(c.participants.indexOf(user._id)===-1){
        c.participants.push(user._id);
        c.save();
        res.send({msg: 'User has been invited'});
    }
    });
});

app.post('/leave-room',async function(req, res) {
    //console.log(req.body);
    const conv = await Conversation.findById({_id: req.body.conv_id});
    const user = await User.findOne({username: req.body.username});
    const index = conv.participants.indexOf(user._id);
    conv.participants.splice(index, 1);
    //console.log(conv.participants);
    await Conversation.findOneAndUpdate({_id: req.body.conv_id}, { $set: {'participants': conv.participants}});
    await res.send({msg: 'left room'});
});


// -------------------------------------------------

async function deleteContact(contact: any, mainUser: any) {
  const contact_id = await User.findOne(contact)
  .then((c) => {
      if (c) {
         // console.log(c._id, 'DELETE');
          return c._id;
      }
  });

const contacts_arr = await User.findOne(mainUser)
  .then((u) => {
      if (u) {
        //  console.log(u.contacts, 'DELETE');
          return u.contacts;
      }
  });

  if (contacts_arr) {
    if (contacts_arr.indexOf(contact_id) !== -1) {
        const index = contacts_arr.indexOf(contact_id);
        await contacts_arr.splice(index, 1);
        await User.findOneAndUpdate(mainUser, { $set: {'contacts': contacts_arr}}).then(c => console.log(c));
       // console.log(contacts_arr, 'DELETE');
        return await {msg: `User deleted`};
    } else {
        return await {msg: `User not found`};
    }
  }
}

async function addContactDB(user: any, contact: any) {
   // console.log(user, contact);

    const contact_id = await User.findOne(contact)
        .then((c) => {
            if (c) {
              //  console.log(c._id);
                return c._id;
            }
        });

    const contacts_arr = await User.findOne(user)
        .then((u) => {
            if (u) {
              //  console.log(u.contacts);
                return u.contacts;
            }
        });

    if (contacts_arr) {
        if (contacts_arr.indexOf(contact_id) === -1) {
            await contacts_arr.push(contact_id);
            await User.findOneAndUpdate(user, { $set: {'contacts': contacts_arr}}).then(c => console.log(c));
           // console.log(contacts_arr);
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
            room: null
    });
    conv.save()
    .then((c) => {
       // console.log('Conversation ', c);
    });
}

function createRoomConversation(user1_id: mongoose.Types.ObjectId, room: String) {
    const conv = new Conversation({
        participants: [user1_id],
            messages: [],
            room: room
    });
    conv.save()
    .then((c) => {
       // console.log('Conversation ', c);
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

    socket.on('chat message', async (data) => {
       // console.log(data);
        await storeMessage(data);
        await returnConversation(data, socket.nickname);
    });

    socket.on('user online', (data: any) => {
        if (data.username !== undefined) {
            socket.nickname = data.username;
            users[socket.nickname] = socket;
           // console.log(socket.nickname, Object.keys(users));
            emitContacts(socket.nickname);
            updateFriendContact(socket.nickname);
        }
    });

    socket.on('force disconnect', () => {
       // console.log(socket.nickname);
        delete users[socket.nickname];
        updateFriendContact(socket.nickname);
    });

    socket.on('disconnect', () => {
        if (!socket.nickname) {
            return;
        }
       // console.log(socket.nickname);
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
               // console.log(obj);
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
    const conv_id = await Conversation.findOne({participants: {$all: [user_id, contact_id]}, room: null})
    .then((c) => {
       // console.log(c, 'fail');
        return c._id;
    });
    return await conv_id;
}

async function storeMessage(data: any) {
    const user = await User.findOne({username: data.author});
    const msg = new Message({
        content: data.msg,
        conversation: data.conv_id,
        author: user._id,
        date: data.date
    });
    const message = await msg.save();

    Conversation.findById({_id: data.conv_id})
    .then((c: any) => {
      c.messages.push(message._id);
      c.save();
    });
}

function returnConversation(data: any, socket_nickname: any) {
  users[socket_nickname].emit('chat conversation', data);
  if(data.to!==null){
    users[data.to].emit('chat conversation', data);
  }
  else{
     Conversation.findById({_id: data.conv_id})
     .populate({
        path: 'participants',
        select: 'username _id'
     })
     .then((c)=>{
         for (let u of c.participants){
             users[u.username].emit('chat conversation', data);
         }
     })
  }
}

async function findUserRooms(user){
    let temp_arr = [];
    const user_id = await User.findOne(user);
    
    const rooms = await Conversation.find({room: { $ne: null }, participants: { $in: [user_id._id] }})
    .populate({
      path: 'participants',
      select: 'username',
    });

    return await rooms;
}


