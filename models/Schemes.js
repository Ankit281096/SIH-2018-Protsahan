const mongoose = require('mongoose');
const { Schema } = mongoose;


const Schemes = new Schema({
  schemename: {
    type: String
  },

  description: {
    type: String
  }
});

const Scheme = mongoose.model('Scheme', Schemes);
module.exports = { Scheme };
