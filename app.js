//////////////////////////////////  PACKAGES  //////////////////////////////////
require('dotenv').config();

const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
////////////////////////////////////////////////////////////////////////////////


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


///////////////////////////////////  MONGODB  //////////////////////////////////
// Local
const url = 'mongodb://localhost:27017/' + process.env.DB;

// Atlas
// const url = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@cluster0.lphdq.mongodb.net/" + process.env.DATABASE;

// Establish connection
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

// Create schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  facebookId: String
});

// Plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Create model
const User = mongoose.model('User', userSchema);
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////  AUTHENTICATION  ///////////////////////////////
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// GOOGLE
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id, username: profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
));

// FACEBOOK
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id, username: profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
));
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////  HOME  ////////////////////////////////////
app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    res.render('home', { show: req.isAuthenticated(), user: req.user.username });
  } else {
    res.render('home', { show: req.isAuthenticated(), user: "" });
  }
});
////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////  REGISTER  //////////////////////////////////
app.route('/register')
  .get(function(req, res) {
    // check if theres an active session / if user logged in previously
    if (req.isAuthenticated()) {
      // if so, redirect to secrets
      res.redirect('/secrets');
    } else {
      // else render the login page
      res.render('register');
    }
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


////////////////////////////////////  LOGIN  ///////////////////////////////////
app.route('/login')
  .get(function(req, res) {
    // check if theres an active session / if user logged in previously
    if (req.isAuthenticated()) {
      // if so, redirect to secrets
      res.redirect('/secrets');
    } else {
      // else render the login page
      res.render('login');
    }
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


///////////////////////////////////  GOOGLE  ///////////////////////////////////
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect
    res.redirect('/secrets');
  });
////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////  FACEBOOK  //////////////////////////////////
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect
    res.redirect('/secrets');
  });
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  LOGOUT  ///////////////////////////////////
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  SECRETS  //////////////////////////////////
app.get('/secrets', function(req, res) {
  // check if theres an active session / if user logged in previously
  if (req.isAuthenticated()) {
    // if so render secrets
    res.render('secrets');
  } else {
    // else redirect to login page
    res.redirect('/login');
  }
});
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  SUBMIT  ///////////////////////////////////
app.route('/submit')
.get(function(req, res) {
  // check if theres an active session / if user logged in previously
  if (req.isAuthenticated()) {
    res.render('submit');
  } else {
    res.redirect('/login');
  }
})

.post(function(req, res) {
  const newSecret = req.body.secret;
  res.redirect('/secrets');
});
////////////////////////////////////////////////////////////////////////////////


app.listen(process.env.PORT || 3000, () => console.log("Server successfully started..."));


// console.log('--------------------------- req body --------------------------');
// console.log(req.body);
// console.log('---------------------- req session store ----------------------');
// console.log(req.sessionStore);
// console.log('------------------------ req session id -----------------------');
// console.log(req.sessionID);
// console.log('------------------------- req session  ------------------------');
// console.log(req.session);
// console.log('------------------------- req passport ------------------------');
// console.log(req._passport);
// console.log('--------------------------- req user --------------------------');
// console.log(req.user);
// console.log('---------------------------------------------------------------');
