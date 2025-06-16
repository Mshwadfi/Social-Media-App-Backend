const express = require("express");
const { adminAuth, userAuth } = require("./middlewares/auth");
const app = express();

app.use("/users", userAuth, (req, res, next) => {
  next();
});
app.get(
  "/users",

  (req, res) => {
    res.send("users fetched successfully!");
  }
);

app.post("/users", (req, res) => {
  res.send("user added to data base");
});

app.patch("/users", (req, res) => {
  res.send("user data updated successfully");
});

app.delete("/users", (req, res) => {
  res.send("user has been deleted successfully");
});

app.get("/admin", adminAuth, (req, res) => {
  res.send(" admin data fetched successfully!");
});
app.listen(4000, () => {
  console.log("server is running on prot 4000");
});
