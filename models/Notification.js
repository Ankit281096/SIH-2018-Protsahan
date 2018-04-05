const mongoose = require('mongoose');
const { Schema } = mongoose;


const NotifySchema = new Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  typ: {
    type: String
  },
  status: {
    type: String
  },
  timestamp:{
    type: Date
  },
  answer:{
    type:String
  }
});

const Notifications = mongoose.model('Notifications', NotifySchema);
module.exports = { Notifications };
