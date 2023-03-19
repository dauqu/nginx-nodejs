const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//Allow express to use JSON
app.use(express.json());

// app.use('/file', require('./routes/file'));

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}`)
);
