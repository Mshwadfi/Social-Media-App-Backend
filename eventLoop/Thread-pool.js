const crypto = require("crypto");

process.env.UV_THREADPOOL_SIZE = 5;
crypto.pbkdf2("123", "123", 2000000, 64, "sha512", (err, key) => {
  console.log("1");
});

crypto.pbkdf2("123", "123", 2000000, 64, "sha512", (err, key) => {
  console.log("2");
});

crypto.pbkdf2("123", "123", 2000000, 64, "sha512", (err, key) => {
  console.log("3");
});

crypto.pbkdf2("123", "123", 2000000, 64, "sha512", (err, key) => {
  console.log("4");
});

crypto.pbkdf2("123", "123", 2000000, 64, "sha512", (err, key) => {
  console.log("5");
});

// crypto.pbkdf2("123","123", 2000000, 64, "hello", (err,key)=>{
//     console.log("1")
// })
