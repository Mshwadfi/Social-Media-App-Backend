const adminAuth = (req, res, next) => {
  const token = "token";
  const isAuthorized = token === "token";

  if (!isAuthorized) {
    res.status("401").send("unauthorized request");
  } else {
    console.log("Admin is authorized");
    next();
  }
};

const userAuth = (req, res, next) => {
  const token = "user-token";
  const isAuthorized = token === "user-token";

  if (!isAuthorized) {
    res.status("401").send("unauthorized request");
  } else {
    console.log("user is authorized");
    next();
  }
};

module.exports = { adminAuth, userAuth };
