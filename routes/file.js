const express = require("express");
const router = express.Router();
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const { exec } = require("child_process");


//Read file
router.get("/", (req, res) => {

  const db = new sqlite3.Database('bdns.db');

  //Read data and return as JSON
  db.serialize(function () {
    db.all("SELECT * FROM dns", function (err, rows) {
      res.json(rows);
    });
  });
});

//Write file
router.post("/", (req, res) => {

  const db = new sqlite3.Database('bdns.db');

  const body_data = req.body.dns_name;

  //Check if the dns name is already in the database
  db.serialize(function () {
    db.all("SELECT * FROM dns WHERE dns_name = '" + body_data + "'", function (err, rows) {
      if (rows.length > 0) {
        res.send("DNS name already exists");
        return;
      }
    });
  });

  //Add blocklisted dns name to database
  db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS dns (id INTEGER PRIMARY KEY AUTOINCREMENT, dns_name TEXT)");
    db.run("INSERT INTO dns (dns_name) VALUES ('" + body_data + "')");
  });


  let blacklisted_dns = [];

  // Query the database and append the results to the array
  db.all('SELECT * FROM dns', (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      blacklisted_dns.push(row);
    });
    try {
      var data = `server {
        #listen 80;
        server_name mediasrv247.com;
        location / {
            proxy_pass http://localhost:3000/;
        }
    
        referer_hash_bucket_size 64;
        valid_referers server_names

${blacklisted_dns.map((dns) => {
        return "        " + dns.dns_name;
      }).join("\n")};

        if ($invalid_referer) {
            return 403;
        }
        
        listen 443 ssl; # managed by Certbot
        ssl_certificate /etc/letsencrypt/live/mediasrv247.com/fullchain.pem; # managed by Certbot
        ssl_certificate_key /etc/letsencrypt/live/mediasrv247.com/privkey.pem; # managed by Certbot
        include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
      }
    
      server {
        if ($host = mediasrv247.com) {
            return 301 https://$host$request_uri;
        } # managed by Certbot
    
    
        server_name mediasrv247.com;
        listen 80;
        return 404; # managed by Certbot
    }`;

      //Nginx config file path
      path = "/etc/nginx/sites-available";

      fs.writeFile(path + "/test.conf", data, (err) => {
        if (err) {
          console.error(err);
          return;
        }

        //Restart nginx
        exec("sudo systemctl restart nginx", (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
        });
        res.send("File has been created");
      });
    } catch (error) {
      console.log(error);
    }

    // Close the database connection when finished
    db.close();
  });
});

//Delete data by ID 
router.delete("/:id", (req, res) => {
  const db = new sqlite3.Database('bdns.db');

  const id = req.params.id;


  db.run("DELETE FROM dns WHERE id = ?", id, function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Error deleting data." });
    }

    console.log(`Row(s) deleted: ${this.changes}`);
    return res.status(200).json({ message: "Data deleted successfully." });
  });

  db.close();
});



module.exports = router;