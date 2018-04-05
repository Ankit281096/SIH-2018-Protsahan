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

app.get('/', (req, res) => {
  // res.sendFile(__dirname + "/views/index.html");
  res.render('index');
});



app.get('/scheme',(req, res) =>{
  res.render('scheme');
})

app.get('/profile', (req, res) => {
   if(typeof req.session.user === 'undefined'){
     return res.redirect('/');
   }

  if (req.query.message === 'user_created') {
    res.render('profile', { message: 'User created succesfully!' });
  }
  else if (req.query.message === 'user_deleted') {
    res.render('profile', { new_message: 'User deleted succesfully!' });
  }

  else res.render('profile');
  // else  res.sendFile(__dirname + '/views/profile.html');
});

app.get('/dashboard', (req, res) => {
  //console.log('-----------------fdhfdhfkdfk-------------',req.session);
  if(typeof req.session.user === 'undefined'){
    return res.redirect('/');
  }

  res.render('dashboard', { req, res});
});



app.get('/employeelogin/updatepassword', (req, res) => {
  res.render('updatepassword');
});

app.get('/employee', (req, res) => {
  res.render('employee');
});

app.get('/adminlogin/removeuser', (req, res) => {
  res.render('removeuser');
});

 app.get('/adminlogin/updatepassword', (req,res) => {
   res.render('updatepasswordadmin');
});

app.get('/adminlogin/updatepassword', (req,res) => {
  res.render('updatepassword');
});

app.get('/livesession',(req,res) => {
  res.render('livesession');
})

app.post("/adminlogin", (req, res) => {
    Head.find({ username: req.body.username, password: req.body.password}, function(err, user){
    //  console.log(user);
      if(err || !user.length){
          // res.sendFile(__dirname + '/views/error.html');
          // return res.redirect('/');

          res.render('index', { error_message: 'invaild login' });
      }
       else{
         req.session.user=user;
          return res.redirect('profile');
       };
    })
});

app.post("/employeelogin", (req, res) => {
    Employees.find({ username: req.body.username, password: req.body.password}, function(err, user){
      //console.log(user);
      if(err){
         //console.log(err);
          res.status(500).send({
           message:err
         });
       }
      else if(user.length < 1) {
        // res.status(404).send({
        //   message:'User not found'
        // });
        res.render('index', { error_message: 'invaild login' });
       }
       else{
       //  res.status(200).send({
       //   message:'Succesfully logged in'
       // });
       //console.log(user);
       req.session.user = user;
       return res.redirect('dashboard');
     };
    })
});

app.get('/allusers', (req, res) => {
  //console.log(req.session.user[0].state)
  Employees.find({},
    (err, users) => {
      if(users === null)
       console.log('no user found');
      else
        res.render('allusers', { req, res, users });
    }
  );
})

app.get('/allnotifications', (req, res) => {
  //console.log(req.session.user[0].state)
  Notifications.find({typ:'for_Dashboard'},
    (err, notes) => {
      if(notes === null)
       console.log('no user found');
      else
        res.render('allnotifications', { req, res, notes });
    }
  );
})

app.post('/adminlogin/adduser', async(req, res) => {
  async.waterfall([
    function(done) {
      var employee = new Employees({
         email: req.body.email,
         username :req.body.username,
         department: req.body.department,
         state:req.body.state,
         password : generator.generate({
        length: 6,
        numbers: true
        })
      });
      employee.save(function(err) {
        // res.json({message:'Successfully created'});
        done(err,employee);
      })
    },
    function(employee, done) {
        var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'harshit.jain17071996@gmail.com',
          pass: '17July1996'
        }
      });
      var mailOptions = {
        from: 'harshit.jain17071996@gmail.com',
        to: employee.email,
        subject: 'Mail from Agency',
        html: `<html>
<body>
  <h3>Here are your details required for logging in : </h3>
  <div><p>Username:${employee.username}</p></div>
  <div><p>Password:${employee.password}</p></div>
  <p>You can change the password in your portal by selecting <strong>Change password</strong> option</p>
  <br>
  <br>
  <p>Regards,</p>
  <p>Team Code_Guerrero</p>
</body>
</html>
`
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          //console.log('email sent');
          res.redirect('/profile?message=user_created');
        }
      });
    }


  ],function(err) {
    if(err) return next(err);
  });
});

app.post("/adminlogin/removeuser", (req, res) => {
    Employees.findOneAndRemove({ email: req.body.email}, function(err,user){
      //console.log(user);
      if(err || user == null){
        res.render('removeuser', { error_message: 'invalid user' });
       }
       else{
       //  res.status(200).send({
       //   message:'Succesfully logged in'
       // });

          res.redirect('/profile?message=user_deleted');
     };
    })
});

app.post("/employeelogin/updatepassword", (req, res) => {
  Employees.findOneAndUpdate({password: req.body.oldpassword}, {$set:{password:req.body.newpassword}},function(err, doc){
      if(doc === null){
          res.render('updatepassword', { error_message: 'invaild login' });
      }
      else{
       res.redirect('/dashboard?message=Password Updated Successfully');
      }
  });
});

app.post("/adminlogin/updatepassword" ,(req, res) => {
  Head.findOneAndUpdate({password:req.body.oldpassword}, {$set:{password:req.body.newpassword}},function(err,doc){
    if(doc === null){
      res.render('updatepasswordadmin',{ error_message: 'invalid login' });
    }
    else{
      res.redirect('/profile?message=Password Updated Successfully');
    }
  })
})

app.post('/employeelogin/addscheme', (req, res) => {
   var schemes = new Scheme ({
     schemename:req.body.schemename,
     description:req.body.description
   });
   schemes.save()
   .then(result => {
     Artisan.find({},'fcmtoken',function(err,doc){
       if (err){
         return res.send({message:Unsuccessful});
       }
       let fcmtoken=[];
       for(var i=0;i<doc.length;i++)
       {
         fcmtoken.push(doc[i].fcmtoken)
       }
       answer1=result.description
       answer=result.schemename;
       const url="https://fcm.googleapis.com/fcm/send";

   //   'Authorization': 'key=AAAAD40Q9JY:APA91bEhbfyVKiOTdTuzirQeqGpkB165eiKbaEnbFONJzJOjkVki1372DLi4zb1gCsWP8uUDLPLNVpVjI3tPK1M6n-Jop8Ryd5x__ei1eM29q7hK7z_DUBU8w9e76iL0y_f2biax60sj',

   axios.defaults.headers.common['Authorization'] = 'key=AAAAD40Q9JY:APA91bEhbfyVKiOTdTuzirQeqGpkB165eiKbaEnbFONJzJOjkVki1372DLi4zb1gCsWP8uUDLPLNVpVjI3tPK1M6n-Jop8Ryd5x__ei1eM29q7hK7z_DUBU8w9e76iL0y_f2biax60sj';
   axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
       axios.post(url,{
       "registration_ids": fcmtoken,
       data : {
       body :  answer1 + answer,
       title : "Schemes",
       click_action: ".Query.View.QueryActivity"
       }
       }).then((response)=>{
         console.log(response);
          res.redirect('/dashboard');
       }).catch((e)=>{
         console.log(e);
       });
     });

   })
   .catch(e => {
       res.render('scheme', { error_message: 'invalid user' });

   });
});

app.get('/dashboard/artisans', (req, res) => {
  //console.log(req.session.user[0].state)
  Artisan.find({ state: req.session.user[0].state },
    (err, artisans) => {
      if(err === null)
        res.render('artisans', { req, res, artisans });
    }
  );
})

app.get('/dashboard/artisans/all', (req, res) => {
//  console.log(req.session.user[0].state)
  Artisan.find({},
    (err, artisans) => {
      if(err === null)
        res.render('artisans_all', { req, res, artisans });
    }
  );
})

app.get('/dashboard/artisan/profile', (req, res) => {
  console.log(req.session.user[0].state)
  console.log(req.query.id)
  Artisan.findOne({ _id: req.query.id },
    (err, artisan) => {
      console.log(artisan)
      if(err === null)
        res.render('artisan_profile', { req, res, artisan });
    }
  );
})

app.get('/dashboard/artisans/qalist', (req, res) => {
  console.log(req.session.user[0].state)
  Queries.find({},
    (err, questions) => {
      if(err === null)
        res.render('QAlist', { req, res, questions });
    }
  );
})

app.get('/dashboard/artisan/question', (req, res) => {
  console.log(req.session.user[0].state)
  console.log(req.query.id)
  Queries.findOne({ _id: req.query.id },
    (err, question) => {
      console.log(question)
      if(err === null)
        res.render('Question', { req, res, question });
    }
  );
})

// app.post('/dashboard/answer',(req,res) => {
//   Queries.findOneAndUpdate({_id:req.body.id},{$set:{answer:req.body.answer,status:"true"}}, function(err, doc)  {
//     if(doc == null){
//       res.render('Question');
//     }
//     else{
//       var notification = new Notifications ({
//         title:"Answered",
//         description:"It is an query",
//         typ:"for_users",
//         status:"true",
//         timestamp:Date.now()
//       })
//       notification.save()
//       .then(result => {
//         //send FCM notification
//       })
//       .catch(e => {
//        console.log(e);
//       });
//     }
//   });
// });
app.post('/dashboard/answer', (req, res) => {
 let answer=req.body.answer;
 let id=req.body.id;
 Queries.findOneAndUpdate(
   { _id: req.body.id },
   { $set: { answer: answer, status: 'true' } },
   function(err, doc) {
     //console.log(doc);
     if (doc == null) {
       res.render('Question');

     } else {
       console.log(doc);
       var notification = new Notifications({
         title: 'Answered',
         description: doc.query,
         typ: 'for_users',
         status: 'true',
         answer:answer,
         timestamp: Date.now()
       });
       notification.save()
         .then(result => {
           //console.log(result);
           console.log(doc.artisan_id);
           Artisan.findOne({_id:doc.artisan_id},function(err,doc){
             if (err){
               return res.send({message:'Error'});
             }
             console.log(answer);
             console.log(doc.fcmtoken);
             const url="https://fcm.googleapis.com/fcm/send";

//   'Authorization': 'key=AAAAD40Q9JY:APA91bEhbfyVKiOTdTuzirQeqGpkB165eiKbaEnbFONJzJOjkVki1372DLi4zb1gCsWP8uUDLPLNVpVjI3tPK1M6n-Jop8Ryd5x__ei1eM29q7hK7z_DUBU8w9e76iL0y_f2biax60sj',

axios.defaults.headers.common['Authorization'] = 'key=AAAAD40Q9JY:APA91bEhbfyVKiOTdTuzirQeqGpkB165eiKbaEnbFONJzJOjkVki1372DLi4zb1gCsWP8uUDLPLNVpVjI3tPK1M6n-Jop8Ryd5x__ei1eM29q7hK7z_DUBU8w9e76iL0y_f2biax60sj';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
             axios.post(url,{
             "registration_ids": [doc.fcmtoken],
             data : {
             body : "Your query has been answered" + " " + answer,
             title : "Queries",
             click_action: ".Query.View.QueryActivity"
             }
             }).then((response)=>{
               console.log(response);
               //res.send({success:true});
               res.redirect("/dashboard/artisans/qalist");
             }).catch((e)=>{
               console.log(e);
             });

           });
         //send FCM notification
     })
     .catch(e => {
           console.log(e);
         });
     }
   }
 );
});

app.get('/logout',(req,res) => {
   req.session=null;
   res.redirect('/index');
});


// Routes created by Ankit for mobileApp
app.post('/api/notifications', (req, res) => {
  Notifications.find({typ:'for_users'}, function(err, notes) {
    if (err) {
      return res.send({
        message: err
      });
    }
    console.log(notes);
    res.send({queries:notes,success:true,message:'Found Successfully'});
  });
});

app.post('/api/query', (req, res) => {
  console.log(req.body.artisan_id);
  var query = new Queries({
    artisan_id: req.body.artisan_id,
    query: req.body.query,
    status: 'false',
    timestamp: Date.now()
  });
  query.save().then(result => {
    console.log(result.query);
      var notification = new Notifications({
        title: 'New question has been asked',
        description: result.query,
        typ: 'for_Dashboard',
        status: 'false',
        timestamp: Date.now()
      });
      notification.save().then(result => {
          console.log(result);
          res.status(200).json({
            message: 'Query Posted Successfully'
          });
        })
        .catch(e => {
          res.status(409).json({
            messsage: e
          });
        });
    })
    .catch(e => {
      res.status(409).json({
        message: e
      });
    });
});

//Routes Created by Ankit
app.post('/api/artisans', (req, res) => {
  console.log(req.body.username);
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);

  var artisan = new Artisan({
    username: req.body.username,
    password: hash,
    profilephoto:'public/uploads/placeholder.png'
  });

  artisan.save().then(artisan => {
    console.log(artisan);
    res.status(201).json({
        message: 'User Created',
        success: true
      });
  }  ).catch(e => {
    {
      if (e.code === 11000) {
        return res.json({
          message: 'Mail Exists',
          success: false
        });
      }
      return res.json({
        message: 'network error',
        success: false
      });
    }
      });
});

app.post('/api/artisans/login', (req, res, next) => {
  console.log(req.body.username);
  Artisan.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.json({
          message: 'Auth Failed',
          success: false
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.json({
            message: 'Auth Failed',
            success: false
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              username: user[0].username,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: '5h'
            }
          );
          return res.status(200).json({
            message: 'Auth Successful',
            success: true,
            token: token,
            username: user[0].username,
            _id:user[0]._id
          });
        }
        res.json({
          message: 'Auth Failed',
          success: false
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

app.post('/api/artisans/fcmtoken', (req, res, next) => {
  console.log(req.body);
  Artisan.findOneAndUpdate(
    { username: req.body.username },
    { fcmtoken: req.body.fcmtoken },
    { new: true },
    function(err, docs) {
      if (err) return res.send( { error: err });
      return res.json({
        message: 'Token saved',
        success:true
      });
    }
  );
});

app.post('/api/artisans/notificationfcmtoken',(req,res)=>{
  answer=req.body.answer;
  Artisan.find({},'fcmtoken',function(err,doc){
    if (err){
      return res.send({message:Unsuccessful});
    }
    let fcmtoken=[];
    for(var i=0;i<doc.length;i++)
    {
      fcmtoken.push(doc[i].fcmtoken)
    }
    const url="https://fcm.googleapis.com/fcm/send";

//   'Authorization': 'key=AAAAD40Q9JY:APA91bEhbfyVKiOTdTuzirQeqGpkB165eiKbaEnbFONJzJOjkVki1372DLi4zb1gCsWP8uUDLPLNVpVjI3tPK1M6n-Jop8Ryd5x__ei1eM29q7hK7z_DUBU8w9e76iL0y_f2biax60sj',

axios.defaults.headers.common['Authorization'] = 'key=AAAAD40Q9JY:APA91bEhbfyVKiOTdTuzirQeqGpkB165eiKbaEnbFONJzJOjkVki1372DLi4zb1gCsWP8uUDLPLNVpVjI3tPK1M6n-Jop8Ryd5x__ei1eM29q7hK7z_DUBU8w9e76iL0y_f2biax60sj';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    axios.post(url,{
    "registration_ids": fcmtoken,
    data : {
    body :  answer,
    title : "Queries",
    click_action: ".Query.View.QueryActivity"
    }
    }).then((response)=>{
      console.log(response);
      res.render('livesession');
    }).catch((e)=>{
      console.log(e);
    });

    console.log(fcmtoken);
  });
});

app.get('/employeelogin/verification',(req, res) => {
  //  console.log(req.session.user[0].state)
    Artisan.find({},
      (err, artisans) => {
        if(err === null)
          res.render('allvideos', { req, res, artisans });
      }
    );
  });



app.post('/api/artisans/getfcmtoken',(req,res)=>{
  var state=req.body.state;
  if (state === 'all'){
    Artisan.find({},'fcmtoken',function(err,docs){
      if(err){
        return res.json({
          message:'Cannot fetch fcm token',
          success:false
        });
      }
      res.json({docs:docs,message:'Successfully Fetched',success:true});
    });
  }

  else{
    Artisan.find({state:state},'fcmtoken',function(err,docs){
      if(err){
        return res.json({
          message:'Cannot fetch fcm token',
          success:false
        });
      }
      res.json({docs:docs,message:'Successfully Fetched',success:true});
    });
  }
});

app.post('/api/artisans/forgot', (req, res) => {
  async.waterfall(
    [
      function(done) {
        Artisan.findOne({ username: req.body.username }, function(
          err,
          artisan
        ) {
          if (!artisan) {
            return res.json({
              message: 'No account with that email address exists.'
            });
          }
          var username = req.body.username;
          var password = generator.generate({
            length: 6,
            numbers: true
          });
          res.json({ password: password });
          done(err, password, username);
        });
      },
      function(password, username, done) {
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'harshit.jain17071996@gmail.com',
            pass: '17July1996'
          }
        });

        var mailOptions = {
          from: 'harshit.jain17071996@gmail.com',
          to: username,
          subject: 'Sending Email using Node.js',
          text: `New Verificstion Code : ${password}`
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent:');
          }
        });
      }
    ],
    function(err) {
      if (err) return next(err);
    }
  );
});

app.post('/api/artisans/editprofile', (req, res) => {
  console.log(req.body);
  Artisan.findOneAndUpdate(
    { username: req.body.username },
    {
      tribe: req.body.tribe,
      description: req.body.description,
      gender: req.body.gender,
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      aadharNO: req.body.aadharNO,
      state: req.body.state,
       $push: { skills:req.body.skills } ,
      qualification:req.body.qualification
    },
    { new: true },
    function(err, docs) {
      if (err) {
        return res.status(400).json({ message: 'Cannot load the profile' });
      }
      console.log(docs);
      res.send({ docs, success: true, message: 'Profile saved Successfully' });
    }
  );
});

app.post('/api/artisans/fetchprofile', (req, res, next) => {
  console.log(req.body.username);
  Artisan.findOne(
    { username: req.body.username },
    'name description address state tribe aadharNO phone gender profilephoto qualification skills',
    function(err, docs) {
      if (err) {
        return res.status(400).json({ message: 'Unable to load the profile' });
      }
      console.log(docs);
      res.json({ docs: docs, success: true });
    }
  );
});

app.post(
  '/api/artisans/uploadprofilephoto',
  upload.single('profilephoto'),
  (req, res, next) => {
    const qReplace = str => {
      if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
        return str.substr(1, str.length - 2);
      }
    };
    var url = req.file.path;
    console.log(url);
    Artisan.findOneAndUpdate(
      { username: qReplace(req.body.username) },
      { profilephoto: url },
      { new: true },
      function(err, docs) {
        if (err) return res.send(500, { error: err });
        return res.json({
          message: 'Profile Photo Uploaded Succesfully',
          success: true
        });
      }
    );
  }
);

// app.post('/api/artisans/fetchindividualprofile',(req,res,next)=>{
//   console.log(req.body.username);
//   Artisan.findOne({username:req.body.username},'name description address state tribe aadharNO phone gender profilephoto',
//   function(err,docs){
//     if (err){
//     return res.status(400).json({message:'Unable to load the profile'});
//   }
//   res.json({docs:docs ,success:true});
//   });
// });
app.post('/api/artisans/fetchimages', (req, res, next) => {
  console.log(req.body.username);
  Artisan.findOne({ username: req.body.username }, 'images', function(
    err,
    docs
  ) {
    if (err) {
      return res.status(400).json({ message: 'Cannot load images' });
    }
    console.log(docs);
    res.send(docs);
  });
});

app.post('/api/artisans/fetchvideos', (req, res, next) => {
  Artisan.findOne({ username: req.body.username }, 'videos', function(
    err,
    docs
  ) {
    if (err) {
      return res.status(400).json({ message: 'Cannot load videos' });
    }
    console.log(docs);
    res.send(docs);
  });
});

app.post('/api/artisans/fetchpdfs', (req, res, next) => {
  Artisan.findOne({ username: req.body.username }, 'pdfs', function(err, docs) {
    if (err) {
      return res.status(400).json({ message: 'Cannot load pdfs' });
    }
    console.log(docs);
    res.send(docs);
  });
});

app.post(
  '/api/artisans/uploadimages',
  upload.single('images'),
  (req, res, next) => {
    const qReplace = str => {
      if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
        return str.substr(1, str.length - 2);
      }
    };
    var url = req.file.path;
    var title = qReplace(req.body.title);
    Artisan.findOneAndUpdate(
      { username: qReplace(req.body.username) },
      { $push: { images: { url, title } } },
      function(err, docs) {
        if (err) return res.send(500, { error: err });
        console.log(docs);
         res.send({
          message: 'Image Uploaded Succesfully',
          success: true
        });
      }
    );
  }
);

app.post(
  '/api/artisans/uploadvideos',
  upload.single('videos'),
  (req, res, next) => {
    // console.log(req.file);
    const qReplace = str => {
      if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
        return str.substr(1, str.length - 2);
      }
    };
    console.log(req.body.username);
    console.log(qReplace(req.body.username));
    var url = req.file.path;
    var title = qReplace(req.body.title);
    console.log(url);
    console.log(title);

    thumbler.extract(
      `./${url}`,
      `./${url}.png`,
      '00:00:02',
      '800x600',
      function() {
        console.log(
          'snapshot saved to snapshot.png (200x125) with a frame at 00:00:02'
        );
      }
    );
    Artisan.findOneAndUpdate(
      { username: qReplace(req.body.username) },
      { $push: { videos: { url, title, thumbnail: `${url}.png` } } },
      function(err, docs) {
        if (err) return res.send(500, { error: err });
        return res.json({
          message: 'Video Uploaded Successfully',
          success: true
        });
      }
    );
  }
);

app.post(
  '/api/artisans/uploadpdfs',
  upload.single('pdfs'),
  (req, res, next) => {
    const qReplace = str => {
      if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
        return str.substr(1, str.length - 2);
      }
    };
    console.log(req.file);
    var url = req.file.path;
    var title = qReplace(req.body.title);
    Artisan.findOneAndUpdate(
      { username: qReplace(req.body.username) },
      { $push: { pdfs: { url, title } } },
      function(err, docs) {
        if (err) return res.send(500, { error: err });
        return res.json({
          message: 'Pdf File Uploaded Successfully',
          success: true
        });
      }
    );
  }
);

app.post('/api/artisans/deletevideo', (req, res, next) => {
  var username = req.body.username;
  console.log(req.body._id);
  console.log(username);
  Artisan.findOne({ username: username })
    .select()
    .exec(function(err, org) {
      if (err) return res.send({ success: false });
      if (!org) return res.send(err);
      org.videos.id(req.body._id).remove();
      org.save(function(err, org) {
        if (err) return res.send(err);
        return res.send({ org, success: true });
      });
    });
});

app.post('/api/artisans/deleteimage', (req, res, next) => {
  var username = req.body.username;
  console.log(req.body._id);
  console.log(username);
  Artisan.findOne({ username: username })
    .select()
    .exec(function(err, org) {
      if (err) return res.send({ success: false });
      if (!org) return res.send(err);
      org.images.id(req.body._id).remove();
      org.save(function(err, org) {
        if (err) return res.send(err);
        return res.send({ org, success: true });
      });
    });
});

app.post('/api/artisans/deletepdf', (req, res, next) => {
  console.log(req.body.url);
  Artisan.findOneAndUpdate(
    { username: req.body.username },
    { $pull: { pdfs: { url: req.body.url, title: req.body.title } } },
    { upsert: true },
    function(err, docs) {
      if (err) {
        return res.send(500, { error: err });
      }
      console.log(typeof docs);
      res.send(docs);
    }
  );
});
app.post('/api/artisans/changeverificationvideos',(req,res)=>{
  console.log(req.body);
Artisan.update({'videos._id':req.body._id,username:req.body.username},{'$set': {
 'videos.$.status': true}},function(err,docs){
   if (err) return res.send({message:'not done'});
    res.redirect('/employeelogin/verification');
 });
});

app.post('/api/artisans/changeverificationimages',(req,res)=>{
Artisan.update({'images._id':req.body._id,username:req.body.username},{'$set': {
 'images.$.status': true}},function(err,docs){
   if (err) return res.send({message:'not done'});
   res.redirect('/employeelogin/verification');
 });
});

app.get('/api/artisans/files', (req, res, next) => {
 Artisan.find({}, 'images videos username profilephoto name', function(err,docs) {
   if (err) return res.send(500, { error: err });
   console.log(docs);
   res.send({ docs: docs });
 });
});
//console.log(count());

//function count() {




app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
