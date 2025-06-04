const fs = require("fs");
const Process = require("process");
setImmediate(() => console.log("set Immediate"));
setTimeout(() => console.log("set Time Out"), 0);

Promise.resolve().then(() => console.log("Promise"));

fs.readFile("../index.js", "utf8", () => {
  setTimeout(() => {
    console.log("2nd Timer");
  }, 0);

  Process.nextTick(() => console.log("Next Tick 2"));
  setImmediate(() => console.log("set Immediate 2"));
  console.log("File Read Complete");
});

Process.nextTick(() => console.log("Next Tick"));

console.log("End of Event Loop");
