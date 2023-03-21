const express = require("express");
const app = express();
const port = 3000;

//Allow cors
const cors = require("cors");
//Loop of allowed origins
const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//Allow express to use JSON
app.use(express.json());

app.use('/file', require('./routes/file'));

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}`)
);
