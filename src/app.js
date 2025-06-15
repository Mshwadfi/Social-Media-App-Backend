const express = require("express");

const app = express();

app.get(
  "/users",
  (req, res, next) => {
    console.log("route handler 1");
    // res.send("users fetched successfully");
    next();
  },
  (req, res, next) => {
    console.log("route handler 2");
    // res.send("users fetched successfully!");
    next();
  },
  (req, res, next) => {
    console.log("route handler 2");
    // res.send("users fetched successfully!");
    next();
  },
  (req, res, next) => {
    console.log("route handler 2");
    res.send("users fetched successfully!");
    // next();
  }
);

app.listen(3000, () => {
  console.log("server is running on prot 3000");
});
