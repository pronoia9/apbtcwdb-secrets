//////////////////////////////////  PACKAGES  //////////////////////////////////
require('dotenv').config();

const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const saltRounds = 15;

const app = express();
////////////////////////////////////////////////////////////////////////////////


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


///////////////////////////////////  MONGODB  //////////////////////////////////
const db = 'userDB';

// Local
const url = 'mongodb://localhost:27017/' + db;

// Atlas
// const url = "mongodb+srv://" + usr + ":" + pwd + "@cluster0.lphdq.mongodb.net/" + db;

// Establish connection
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Create schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email required.']
  },
  password: {
    type: String,
    required: [true, 'Password required.']
  }
});

// Create model
const User = mongoose.model('user', userSchema);
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
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function(err, user) {
      if (!err) {
        if (user) {
          // Load hash from your password DB.
          bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
              res.render('secrets');
            } else {
              res.send("Email or password does not match.");
            }
          });
        } else {
          res.send("Email or password does not match.");
        }
      } else {
        res.send(err);
      }
    });
  });
////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////  REGISTER  //////////////////////////////////
app.route('/register')
  .get(function(req, res) {
    res.render('register');
  })

  .post(function(req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      const user = new User({
        email: req.body.username,
        password: hash
      });

      user.save(function(err) {
        if (!err) {
          res.render('secrets');
        } else {
          res.send(err);
        }
      });
    });
  });
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  SECRETS  //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  SUBMIT  ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


app.listen(process.env.PORT || 3000, () => console.log("Server successfully started..."));
