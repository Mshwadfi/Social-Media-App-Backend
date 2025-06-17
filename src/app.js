const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.post("/signUp", async (req, res) => {
  const userObj = {
    firstName: "Muhammad",
    lastName: "Alshwadfy",
    email: "mohamedalshwadfy24@gmail.com",
    gender: "male",
    age: "24",
  };

  const user = new User(userObj);
  await user.save(user);
  res.send("user created successfully!");
});

connectDB()
  .then(() => {
    console.log("connected to db!");
    app.listen(4000, () => {
      console.log("server is running on port 4000");
    });
  })
  .catch((err) => {
    console.log("error connecting to db");
  });
