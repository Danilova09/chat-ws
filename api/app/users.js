const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const permit = require('../middleware/permit');
const auth = require("../middleware/auth");
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (e) {
        next(e);
    }
});

router.post('/', auth, permit('admin'), async (req, res, next) => {
    try {
        const userData = {
            email: req.body.email,
            password: req.body.password,
        }

        const user = new User(userData);
        user.generateToken();

        await user.save();
        res.send(user);
    } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
            return res.set(400).send(e);
        }
        return next(e);
    }
});

router.post('/sessions', async (req, res, next) => {
    try {
        const user = await User.findOne({email: req.body.email});

        if (!user) {
            return res.status(400).send({error: 'Email not found'});
        }

        const isMatch = await user.checkPassword(req.body.password);

        if (!isMatch) {
            return res.status(400).send({error: 'Password is wrong'});
        }

        user.generateToken();
        await user.save();

        return res.send(user);
    } catch (e) {
        next(e);
    }
});

router.delete('/sessions', async (req, res, next) => {
    try {
        const token = req.get('Authorization');
        if (!token) return res.status(401).send({error: 'No token!'});

        const user = await User.findOne({token});

        if (!user) return res.status(401).send({error: `User with token ${token} not found!`});

        user.generateToken();
        await user.save();
        return res.send({message: 'Logged out!'});
    } catch (e) {
        next(e);
    }
})

module.exports = router;