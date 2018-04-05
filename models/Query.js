const mongoose = require('mongoose');
const { Schema } = mongoose;


const QuerySchema = new Schema({
  artisan_id: {
    type: String
  },
  query: {
    type: String
  },
  status: {
    type: String
  },
  answer: {
    type: String
  },
  timestamp:{
    type: Date
  }
});

const Queries = mongoose.model('Queries', QuerySchema);
module.exports = { Queries };
