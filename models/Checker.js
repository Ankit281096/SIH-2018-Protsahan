const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;
require('mongoose-long')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const checkingSchema = new Schema({
  username:{
    type:String,
    trim:true,
    unique:true
  }
  dvideos:[{
    url:String,
    title:String,
    thumbnail:String,
    status:{
      type:Boolean,
      default:false
    }
  }],
  dimages:[{
    url:String,
    title:String,
    status:{
      type:Boolean,
      default:false
    }
  }]
});

const Checking = mongoose.model('Checking',checkingSchema );
module.exports = { Checking };
