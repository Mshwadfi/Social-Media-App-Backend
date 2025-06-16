const express = require("express");
const { adminAuth, userAuth } = require("./middlewares/auth");
const app = express();
// always use try catch
// app.use("/", (err, req, res, next) => {
//   if (err) {
//     res.status("500").send("some thing went wrong");
//   }
// });
app.get("/users", (req, res) => {
  // try {
  // res.send("users fetched successfully!");
  throw new Error("an error happend");
  res.send("hello");
  // } catch (error) {
  // res.status(500).send("some thing went wrong from get");
  // next(err);
  // }
});

// app.use("/", (err, req, res, next) => {
//   if (err) {
//     res.status(500).send("some thing went wrong");
//   }
// });

app.listen(4000, () => {
  console.log("server is running on prot 4000");
});
