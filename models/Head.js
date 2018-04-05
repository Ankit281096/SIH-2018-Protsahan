const mongoose = require('mongoose');
const { Schema } = mongoose;


const dHeadSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  department: {
    type: String
  }
});

const Head = mongoose.model('Head', dHeadSchema);
module.exports = { Head };
