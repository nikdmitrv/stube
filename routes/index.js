const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');

router.get('/', async function (req, res, next) {
    // console.log(req.session)
    const user = await User.getUserByName(req.session.username)
    let userid;
    if (user) userid = user.id
    else userid;
    res.render('index', {
        logged: req.session.logged,
    });
});

router.get('/logged', async (req, res) => {
    req.session.logged
        ? res.json({
            data: {
                isLogged: true,
                username: req.session.username,
            }
        })
        : res.json({
            data: { isLogged: false }
        })
});

module.exports = router;