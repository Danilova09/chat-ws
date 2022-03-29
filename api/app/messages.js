const express = require('express');
const {nanoid} = require('nanoid');
const User = require("../models/User");
const router = express.Router();

require('express-ws')(router);

const activeConnections = {};
const activeUsers = [];
const savedMessages = [];


router.ws('/', (ws, req) => {
    const id = nanoid();
    activeConnections[id] = ws;

    let username = '';
    let usersToken = '';

    ws.send(JSON.stringify({
        type: 'PREV_MESSAGES',
        messages: savedMessages,
        activeUsers: activeUsers,
    }))

    ws.on('message', async (msg) => {
        const decodedMessage = JSON.parse(msg);
        switch (decodedMessage.type) {
            case 'LOGIN':
                usersToken = decodedMessage.token;
                const user = await User.findOne({token: decodedMessage.token});
                username = user.displayName;

                activeConnections[id].user = user;
                activeUsers.push({token: decodedMessage.token, user: user})
                Object.keys(activeConnections).forEach(id => {
                    const conn = activeConnections[id];
                    conn.send(JSON.stringify({
                            type: 'NEW_USER',
                            activeUsers: activeUsers,
                        }
                    ))
                })
                break;
            case 'SEND_MESSAGE':
                savedMessages.push(decodedMessage.message);
                Object.keys(activeConnections).forEach(id => {
                    const conn = activeConnections[id];
                    conn.send(JSON.stringify({
                        type: 'NEW_MESSAGE',
                        message: {
                            username,
                            text: decodedMessage.message.text,
                        }
                    }))
                })
                break;
            default:
                console.log('Unknown type:', decodedMessage.type);
        }
    });

    ws.on('close', () => {
        activeUsers.find((item) => {
            if (item.token === usersToken) {
                let index = activeUsers.indexOf(item);
                activeUsers.splice(index, 1);
            }
        });

        Object.keys(activeConnections).forEach(id => {
            const conn = activeConnections[id];
            conn.send(JSON.stringify({
                    type: 'NEW_USER',
                    activeUsers: activeUsers,
                }
            ))
        })

        delete activeConnections[id];
    })
});

module.exports = router;