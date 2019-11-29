const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session)
const client = redis.createClient()

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');

const app = express();

// Подключаем mongoose.
mongoose.connect('mongodb+srv://datauser:neJNDDYBoEGvopZ6@cluster0-qyjcg.mongodb.net/stube?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new RedisStore({
        client,
        host: 'localhost',
        port: 3000,
        ttl: 260,
    }),
    key: 'user_sid',
    secret: 'oh klahoma',
    resave: false,
    saveUninitialized: false,
}))

app.use('/', indexRouter);
// app.use('/item', itemsRouter);
app.use('/user', usersRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;