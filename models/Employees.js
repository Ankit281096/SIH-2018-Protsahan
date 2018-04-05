const mongoose = require('mongoose');
const { Schema } = mongoose;


const employeesSchema = new Schema({
  username: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: [6, 'Password less than 6 characters']
  },
  department: {
    type: String
  },
  state: {
    type: String
  }
});

const Employees = mongoose.model('Employees', employeesSchema);
module.exports = { Employees };
