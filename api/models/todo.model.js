const mongoose = require("mongoose");

const todoSchema = mongoose.Schema({
  listId: { type: String, required: true },
  todoName: { type: String, required: true },
  dueDate: { type: Date, default: Date.now() },
  important: { type: Boolean, default: false },
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model("Todo", todoSchema);
