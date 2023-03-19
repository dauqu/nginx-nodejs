const express = require("express");
const router = express.Router();
const fs = require("fs");

//Read file
router.get("/", (req, res) => {
  fs.readFile("test.conf", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    res.send(data);
  });
});

//Write file
router.post("/", (req, res) => {
  const data = req.body.data;

  //Update file data
  fs.writeFile("test.conf", data, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    res.send("File updated successfully");
  });
});

//Update file data
router.put("/", (req, res) => {
  fs.appendFile("test.conf", req.body, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    res.send("File updated successfully");
  });
});

module.exports = router;
