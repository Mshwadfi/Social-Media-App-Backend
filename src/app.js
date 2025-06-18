const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.use(express.json());
// sign up user
app.post("/signUp", async (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  await user.save(user);
  res.send("user created successfully!");
});

// get user by id
app.get("/users/:id", async (req, res) => {
  const userId = req.params.id;
  console.log(req.params);

  try {
    const user = await User.findById(userId);
    if (user.length !== 0) {
      res.status(200).send(user);
    } else {
      res.status(404).send("user not found");
    }
  } catch (error) {
    res.send("something went wrong");
  }
});
//get All users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    if (users.length === 0) {
      res.status(200).send("there is no users");
    } else {
      res.status(200).send(users);
    }
  } catch (error) {
    res.status(404).send("not found");
  }
});

// update user
app.patch("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const data = req.body;
  console.log(req.body, req.params.id);
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
    });
    if (updatedUser) {
      res.status(200).send({
        message: "user updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).send("user not found");
    }
  } catch (error) {
    res.status(500).send("internal server error");
  }
});

// delete user by id
app.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;
  console.log(req.body);
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
  } catch (error) {
    res.status(500).send("internal server error");
  }
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
