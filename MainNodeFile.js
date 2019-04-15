const express = require('express');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Passport Config
require('./javascript/passport')(passport);
app.set('view engine', 'ejs');
app.set('views','html');


app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  next();
});

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

const upload = require('express-fileupload');
const routes = require('./javascript/updown');

app.use(upload());
app.use('/', routes);
app.use('/css',express.static('html/css'));
app.use('/javascript', express.static('javascript'));
app.use('/images',express.static('images'));
app.use('/MyUploads', express.static('../MyUploads'));

app.listen(8000);