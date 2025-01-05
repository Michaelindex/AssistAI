// Backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  color:       { type: String, default: '#ffffff' },
  completed:   { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', taskSchema);
