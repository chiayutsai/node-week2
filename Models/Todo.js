const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title:{
    type: 'string',
    required: [true,'title 為必填欄位'],
    cast: false
  }
},{versionKey:false, timestamps:true})

const Todo = mongoose.model('Todo',todoSchema)

module.exports = Todo