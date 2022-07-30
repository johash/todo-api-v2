const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3001;

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@to-do-database.iqyhvan.mongodb.net/?retryWrites=true&w=majority`
);

const userRoutes = require("./api/routes/user");
const listRoutes = require("./api/routes/list");
const todoRoutes = require("./api/routes/todo");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/user", userRoutes);
app.use("/list", listRoutes);
app.use("/todo", todoRoutes);

app.use("/", (req, res) => {
  res.send("Server working");
});

app.listen(port, () => {
  console.log("Listening at port: " + port);
});
