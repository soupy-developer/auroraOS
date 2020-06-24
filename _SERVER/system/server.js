const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const mime = require("mime/lite");
const bodyParser = require("body-parser");
const compression = require("compression");
const rimraf = require("rimraf");
const db = require("quick.db");
const bcrypt = require("bcrypt");
var __dirname = path.resolve(__dirname, "../");

app.use(compression());
app.use(express.static(path.resolve(__dirname, "../")));
app.use(bodyParser.json());

const users = {"guest": "guest"};
var permissionsCache = JSON.parse(fs.readFileSync(`${__dirname}/system/filePermissions.json`));
var lastModified = fs.statSync(`${__dirname}/system/filePermissions.json`).mtimeMs;

async function readPermissions(path, user) {
  return new Promise(function(resolve, err) {
    fs.stat(`${__dirname}/system/filePermissions.json`, (err, stats) => {
      if (stats.mtimeMs > lastModified) {
        lastModified = stats.mtimeMs;
        fs.readFile(`${__dirname}/system/filePermissions.json`, (err, data) => permissionsCache = JSON.parse(data));
      }
      if (permissionsCache[path] && permissionsCache[path][user]) resolve(permissionsCache[path][user]);
        else if (permissionsCache[path] && permissionsCache[path]["default"]) resolve(permissionsCache[path]["default"]);
        else if (permissionsCache["userDefaults"][user]) resolve(permissionsCache["userDefaults"][user]);
        else resolve(permissionsCache["userDefaults"]["default"]);
    });
  });
};

// START OS API

// copy and paste below to change passwords for now until Settings is updated
// to set your administrator password, change "admin" to your password
/*bcrypt.hash("admin", 2, function(err, result) {
  db.set("users.admin.password", result);
})*/

app.get("/packages", async function(req, res) {
    const array = [];
    fs.readdir(`${__dirname}/packages`, { withFileTypes: true }, async function(err, data) {
      data = data.filter(dir => dir.isDirectory());
      var canAccess;
      for (const dir of data) {
        const info = require(`${__dirname}/packages/${dir.name}/info.json`);
        if (info.isApp) {
          canAccess = true;
          try { fs.accessSync(`${__dirname}/packages/${dir.name}/icon.webp`, fs.constants.F_OK); } catch(e) { canAccess = false; }
          if (canAccess) {
            const rawIcon = fs.readFileSync(`${__dirname}/packages/${dir.name}/icon.webp`);
            info.icon = await Buffer.from(rawIcon).toString("base64");
          }
        }
        info.directoryName = dir.name;
        array.push(info);
      }
      res.send(array);
    });
});

app.post("/auth", async function(req, res) {
  if (!db.get(`users.${req.body.username}.password`)) return res.send("Denied");
  const hash = await db.get(`users.${req.body.username}.password`);
  bcrypt.compare(req.body.password, hash, function(err, result) {
    if (result === true) {
      bcrypt.hash(req.body.username, 1, function(err, result) {
        users[req.body.username] = result;
        return res.send(result);
      });
    } else if (result === false) return res.send("Denied");
  });
});

// START FILE API

app.post("/file/read/:type/:filePath", async function(req, res) {
  const filePath = req.params.filePath.split("/").filter(str=>str!=="").join("/"); if (filePath.includes("./")) return res.send("Denied");
  const username = req.body.username; if (!(users[username] === req.body.token)) return res.send("Denied");
  if (await readPermissions(filePath, username) < 2) return res.send("Denied");
  
  if (req.params.type === "directory") {
    const array = [];
    fs.readdir(`${__dirname}/${filePath}`, { withFileTypes: true }, function(e, rawDir) {
      for (const file of rawDir) {
        var type = mime.getType(path.extname(file.name));
        if (file.isDirectory() && !type) type = "directory";
        array.push({name: file.name, extension: path.extname(file.name), type: type, path: `${filePath}/${file.name}`});
      };
      res.send(array);
    });
  } else if (req.params.type === "file") {
    fs.readFile(`${__dirname}/${filePath}`, (err, data) => {
      if (err) return res.send("Denied");
      const file = Buffer.from(data).toString("base64");
      res.send(file);
    });
  }
});
app.get("/file/readStatic/:filePath", async function(req, res) {
  fs.readFile(`${__dirname}/${req.params.filePath}`, (err, data) => {
    res.writeHead(200);
    res.end(data);
  });
})
app.post("/file/write/:type/:filePath", async function(req, res) {
  const filePath = req.params.filePath.split("/").filter(str=>str!=="").join("/"); if (filePath.includes("./")) return res.send("Denied");
  const username = req.body.username; if (!users[username] === req.body.token) return res.send("Denied");
  
  if (req.params.type === "directory") {
    if (await readPermissions(path.resolve(filePath, "./"), username) < 3) return res.send("Denied");
    
    fs.mkdir(`${__dirname}/${filePath}`, function(){ return res.send("Complete"); });
  } else if (req.params.type === "file") {
    if (await readPermissions(filePath, username) < 3) return res.send("Denied");
    
    const file = Buffer.from(req.body.data, "base64").toString("ascii");
    fs.writeFile(`${__dirname}/${filePath}`, file, "ascii", function(){ return res.send("Complete"); });
  }
});
app.post("/file/rm/:type/:filePath", async function(req, res) {
  const filePath = req.params.filePath.split("/").filter(str=>str!=="").join("/"); if (filePath.includes("./")) return res.send("Denied");
  const username = req.body.username; if (!users[username] === req.body.token) return res.send("Denied");
  if (await readPermissions(filePath, username) < 4) return res.send("Denied");
  
  if (req.params.type === "directory") rimraf(`${__dirname}/${filePath}`, function(){ res.send("Complete"); }); else if (req.params.type === "file") fs.unlink(`${__dirname}/${filePath}`, function(){ return res.send("Complete"); });
});

app.listen(port, () => console.log(`auroraOS started on port ${port}`));