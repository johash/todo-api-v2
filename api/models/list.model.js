const mongoose = require("mongoose");

const listSchema = mongoose.Schema({
  userId: { type: String, required: true },
  listName: { type: String, required: true },
});

module.exports = mongoose.model("List", listSchema);
