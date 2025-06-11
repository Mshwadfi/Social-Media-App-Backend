const express = require("express");

const app = express();

app.get("/users", (req, res) => {
  res.send("here the users data yu requested");
});

app.post("/users", (req, res) => {
  console.log("processing the request...");
  console.log("validating the request data...");
  console.log("saving data to DB");

  res.send("user created successfully");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("server is running on port 3000");
});
