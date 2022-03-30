const express = require('express');
const User = require("../models/User");
const Message = require('../models/Message');
const {nanoid} = require('nanoid');
const router = express.Router();

require('express-ws')(router);

const activeConnections = {};
const activeUsers = [];


router.ws('/', (ws, req) => {
    const id = nanoid()
    let usersId = '';

    ws.on('message', async (msg) => {
        const decodedMessage = JSON.parse(msg);

        const savedMessages = await Message.find().populate('author');

        ws.send(JSON.stringify({
            type: 'PREV_CHAT_DATA',
            messages: savedMessages,
            activeUsers: activeUsers,
        }));

        switch (decodedMessage.type) {
            case 'LOGIN':
                const user = await User.findOne({token: decodedMessage.token});
                usersId = user._id;
                activeConnections[id] = ws;

                const isOnline = activeUsers.find(item => item.user._id.toString() === usersId.toString());

                if (!isOnline) {
                    activeUsers.push({id: id, user: user})
                    dataChanged('ACTIVE_USERS_CHANGED', 'activeUsers', activeUsers);
                }

                break;
            case 'SEND_MESSAGE':
                const author = await User.findOne({_id: usersId});

                const messageData = {
                    text: decodedMessage.message.text,
                    author,
                }

                const message = new Message(messageData);
                await message.save();

                dataChanged('NEW_MESSAGE', 'message', message);

                break;
            default:
                console.log('Unknown type:', decodedMessage.type);
        }
    });

    ws.on('close', () => {
        delete activeConnections[id];

        activeUsers.forEach((item) => {
            if (item.id === id) {
                let index = activeUsers.indexOf(item);
                activeUsers.splice(index, 1);
            }
        });
        dataChanged('ACTIVE_USERS_CHANGED', 'activeUsers', activeUsers);
    })
});

const dataChanged = (type, changedDataNameAsAString, dataValue) => {
    Object.keys(activeConnections).forEach(id => {
        const conn = activeConnections[id];
        conn.send(JSON.stringify({
            type: type,
            [changedDataNameAsAString]: dataValue,
        }))
    })
}

module.exports = router;