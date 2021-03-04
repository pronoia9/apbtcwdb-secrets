//////////////////////////////////  PACKAGES  //////////////////////////////////
require('dotenv').config();

const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const md5 = require('md5');
const mongoose = require('mongoose');

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
    const password = md5(req.body.password);

    User.findOne({ email: username }, function(err, user) {
      if (!err) {
        if (user.password === password) {
          res.render('secrets');
        } else {
          res.send("Password does not match... " + err);
        }
      } else {
        res.send("Email does not exist... " + err);
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
    const user = new User({
      email: req.body.username,
      password: md5(req.body.password)
    });

    user.save(function(err) {
      if (!err) {
        res.render('secrets');
      } else {
        res.send(err);
      }
    });
  });
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  SECRETS  //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////  SUBMIT  ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


app.listen(process.env.PORT || 3000, () => console.log("Server successfully started..."));
