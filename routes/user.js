const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// рендер формы регистрации
router.get('/signup', (req, res) => {
    res.render('./users/signup');
})
// Обработчик на логаут, который будет
// Удалять у пользователя куку и перенаправлять
// На главную страницу приложения
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})


router.get('/signin', (req, res) => {
    res.render('./users/signin');
})
// Обработчик пост-запроса на адрес /login
// Который проверяет соответсвие имени и пароля
// При совпадении присваивает куку
router.post('/signin', async (req, res) => {
    let currentUser = await User.getUserByName(req.body.username);
    if (!currentUser) {
        res.send(JSON.stringify({
            data: {
                error: true,
                message: 'Wrong username!',
            }
        }))
    }
    bcrypt.compare(req.body.password, currentUser.password, function (err, result) {
        if (result) {
            req.session.logged = 'true';
            req.session.username = req.body.username;
            res.send(JSON.stringify({
                data: {
                    error: false,
                    message: 'Authorized',
                }
            }));
        } else {
            res.send(JSON.stringify({
                data: {
                    error: true,
                    message: 'Wrong password!',
                }
            }));
        }
    })

})

//отображение пользователя по id
router.get('/:id', async (req, res) => {
    const user = await User.getUser(req.params.id);
    res.render('./users/index', {
        username: user.name,
        userid: req.params.id,
        userLogged: req.session.logged,
    });
})

// router.get('/:id/items', async (req, res) => {
//     const user = await User.getUser(req.params.id);
//     const auctions = await Item.getByOwner(user.name);
//     res.render('users/items', {
//         auctions,
//         userLogged: req.session.logged,
//         userid: user.id,
//     });
// })
//отображение формы авторизации
// передача данных о регистрации на сервер

router.post('/', async (req, res) => {                // TODO: сделать json с ошибкой
    console.log(req.body);

    const validateUsername = await User.findOne({
        name: req.body.username,
    })

    const validateEmail = await User.findOne({
        email: req.body.email,
    })

    if (validateUsername || validateEmail) {
        res.send(JSON.stringify({ validationError: 'This username or email is already in use!' }))
    } else {
        bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
            let newUser = new User({
                name: req.body.username,
                password: hash,
                email: req.body.email,
                bids: [],
            });
            await newUser.save();
        })
        res.send(JSON.stringify({ redirectTo: '/' }));
    }
    // res.redirect('/');
})

module.exports = router;