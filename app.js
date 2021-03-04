//////////////////////////////////  PACKAGES  //////////////////////////////////
const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');

const app = express();
////////////////////////////////////////////////////////////////////////////////


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'Our little test secret.',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


///////////////////////////////////  MONGODB  //////////////////////////////////
const db = 'userDB';

// Local
const url = 'mongodb://localhost:27017/' + db;

// Atlas
// const url = "mongodb+srv://" + usr + ":" + pwd + "@cluster0.lphdq.mongodb.net/" + db;

// Establish connection
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

// Create schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

// Create model
const User = mongoose.model('user', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////  HOME  ////////////////////////////////////
app.get('/', function(req, res) {
  res.render('home');
});
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////  LOGIN  ///////////////////////////////////
app.route('/login')
  .get(function(req, res) {
    res.render('login');
  })

  .post(function(req, res) {
    const user = new User ({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err) {
      if (!err) {
        passport.authenticate('local')(req, res, function() {
          res.redirect('/secrets');
        });
      } else {
        console.log(err);
        res.redirect('/login');
      }
    });
  });
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  LOGOUT  ///////////////////////////////////
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////  REGISTER  //////////////////////////////////
app.route('/register')
  .get(function(req, res) {
    res.render('register');
  })

  .post(function(req, res) {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
      if (!err) {
        passport.authenticate('local')(req, res, function() {
          res.redirect('/secrets');
        });
      } else {
        console.log(err);
        res.redirect('/register');
      }
    });
  });
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  SECRETS  //////////////////////////////////
app.get('/secrets', function(req, res) {
  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
});
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  SUBMIT  ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


app.listen(process.env.PORT || 3000, () => console.log("Server successfully started..."));
