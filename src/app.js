const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();
const routes = require("./routes");
const {
  notFoundMiddleware,
  errorHandleMiddleware
} = require("./middlewares");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.use(notFoundMiddleware);
app.use(errorHandleMiddleware);

module.exports = app;
