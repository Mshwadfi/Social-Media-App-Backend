const http = require("node:http");

const server = http.createServer((req, res) => {
  if (req.url === "/secret") {
    res.end("there is no secret data");
    return; // Prevent executing the next res.end()
  }
  res.end("Salam Alaykom From Node JS hServer");
});

server.listen(10);
