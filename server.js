const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
var nodemailer = require('nodemailer');
const checkAuth = require('./middleware/check-auth');
var generator = require('generate-password');
const async = require('async');
const session = require('express-session');
var thumbler = require('video-thumb');
var flash = require('express-flash');
const axios = require('axios');
// const ejs = require('ejs');
// const flash = require('flash');
// var flash = require('express-flash-messages')

var { Artisan } = require('./models/Artisans');
var { Head } = require('./models/Head');
var { Employees } = require('./models/Employees');
var { Scheme } = require('./models/Schemes');
var { Notifications } = require('./models/Notification');
var { Queries } = require('./models/Query')
const app = express();

//add ejs
app.set('view engine', 'ejs');

//sessions setup
var sess = {
  secret: 'keyboard cat',
  cookie: {}
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));

app.use(express.static(path.join(__dirname,'public')));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const FileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|pdf)$/)) {
    return cb(new Error('You can upload images,pdf and .mp4 videos'), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: FileFilter });


mongoose.connect('mongodb://localhost:27017/Protsahan');
var port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

//Routes Created by Harshit for web dashboard





app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
