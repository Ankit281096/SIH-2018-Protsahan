const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;
require('mongoose-long')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const artisanSchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: true
  },
  name: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: [6, 'Password less than 6 characters']
  },
  aadharNO: {
    type: String
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  pincode: {
    type: Number
  },
  state: {
    type: String,
    trim: true
  },
  images: [{
    url:String,
    title:String,
    status:{
      type:Boolean,
      default:false
    }
  }],
  videos:[{
    url: String,
    title:String,
    thumbnail:String,
    status:{
      type:Boolean,
      default:false
    }
  }],
  pdfs:[{
    url: String,
    title:String
  }],
  profilephoto: {
    type: String
  },
  tribe: {
    type: String
  },
  gender: {
    type: String
  },
  description:{
    type:String
  },
  fcmtoken:{
    type:String
  },
  qualification:{
    type:String
  },
  skills:[String],

});

//{ $push: { videos: video } }
//   tokens: [
//     {
//       access: {
//         type: String,
//         required: true
//       },
//       token: {
//         type: String,
//         required: true
//       }
//     }
//   ]
// },
// {
//   usePushEach: true
// }
// artisanSchema.methods.generateAuthToken = function() {
//   var artisan = this;
//   var access = 'auth';
//   var token = jwt
//     .sign({ _id: artisan._id.toHexString(), access }, 'abc123')
//     .toString();
//
//   artisan.tokens.push({ access, token });
//
//   return artisan.save().then(() => {
//     return token;
//   });
// };

const Artisan = mongoose.model('Artisan', artisanSchema);
module.exports = { Artisan };

// app.post('/api/artisans/forgot',(req,res,next)=>{
//   async.waterfall([
//     function(done) {
//       crypto.randomBytes(20, function(err, buf) {
//         var token = buf.toString('hex');
//         done(err, token);
//       });
//     },
//     function(token, done) {
//       Artisan.findOne({ email: req.body.email }, function(err, artisan) {
//         if (!artisan) {
//           return res.json({message:'No account with that email address exists.'});
//         }
//         artisan.resetPasswordToken = token;
//         artisan.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//         artisan.save(function(err) {
//           done(err, token, artisan);
//         });
//       });
//     },
//     function(token, user, done) {
//       var smtpTransport = nodemailer.createTransport('SMTP', {
//         service: 'SendGrid',
//         auth: {
//           user: 'Ankit281096',
//           pass: 'Ankit@281096'
//         }
//       });
//       var mailOptions = {
//         to: artisan.email,
//         from: 'passwordreset@demo.com',
//         subject: 'Node.js Password Reset',
//         text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//           'http://' + req.headers.host + '/reset/' + token + '\n\n' +
//           'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         res.send('info', 'An e-mail has been sent to ' + artisan.email + ' with further instructions.');
//         done(err, 'done');
//       });
//     }],function(err) {
//     if (err) return next(err);
//     res.redirect('/forgot');
//   }
// );
// });
//
// app.get('/reset/:token', function(req, res) {
//   Artisan.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, artisan) {
//     if (!artisan) {
//       req.flash('error', 'Password reset token is invalid or has expired.');
//       return res.redirect('/forgot.html');
//     }
//     res.render('reset', {
//       user: req.user
//     });
//   });
// });
// { $pull: { videos:{url:req.body.url,title:req.body.title} } },
// {upsert:true}

// console.log(req.body.username);
// console.log(req.body.url);
// console.log(req.body.title);
// Artisan.update(
//   { username: req.body.username},
//   { $pull: { videos:{url:req.body.url,title:req.body.title} } },
//   function(err, docs) {
//     if (err) {
//       return res.send(500, { error: err });
//     }
//     console.log( docs);
//     res.send({docs,success:true});
//   }
// );
