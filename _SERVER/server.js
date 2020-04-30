const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const mime = require("mime/lite");
const bodyParser = require("body-parser");
const compression = require("compression");
const rimraf = require("rimraf");
const minify = require("express-minify");

app.use(compression());
app.use(minify());
app.use(express.static(path.join(__dirname, "../")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// START OS API

app.get("/packages", async function(req, res) {
    const array = [];
    const packages = fs.readdirSync(`${__dirname}/packages`, { withFileTypes: true }).filter(dir => dir.isDirectory());
    let canAccess;
    for (const dir of packages) {
      const info = require(`${__dirname}/packages/${dir.name}/info.json`);
      if (info.isApp) {
        canAccess = true;
        try { fs.accessSync(`${__dirname}/packages/${dir.name}/icon.webp`, fs.constants.F_OK); } catch(e) { canAccess = false; }
        if (canAccess) {
          const rawIcon = fs.readFileSync(`${__dirname}/packages/${dir.name}/icon.webp`);
          info.icon = await Buffer.from(rawIcon).toString("base64");
        }
      }
      array.push(info);
    }
    res.send(array);
});

// START FILE API

app.get("/file/read/:type/:filePath", async function(req, res) {
    if (req.params.type === "directory") {
        const array = [];
        fs.readdir(`${__dirname}/${req.params.filePath}`, { withFileTypes: true }, function(e, rawDir) {
          for (const file of rawDir) {
            var type = mime.getType(file.name.split('.').pop());
            if (file.isDirectory() && !type) type = "directory";
            array.push({name: file.name, type: type, path: `${req.params.filePath}/${file.name}`});
          };
          res.send(array);
        });
    } else if (req.params.type === "file") {
        fs.readFile(`${__dirname}/${req.params.filePath}`, (err, data) => {
          const file = Buffer.from(data).toString("base64");
          res.send(JSON.stringify(file));
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
    if (!(req.params.filePath.includes("home"))) return;
    if (req.params.type === "directory") {
        fs.mkdir(`${__dirname}/${req.params.filePath}`);
    } else if (req.params.type === "file") {
        const file = Buffer.from(req.body.data, "base64").toString("ascii");
        fs.writeFile(`${__dirname}/${req.params.filePath}`, file, "ascii")
    }
});
app.post("/file/rm/:type/:filePath", async function(req, res) {
    if (!(req.params.filePath.includes("/home"))) return;
    if (req.params.type === "directory") {
        rimraf(`${__dirname}/${req.params.filePath}`);
    } else if (req.params.type === "file") {
        fs.unlink(`${__dirname}/${req.params.filePath}`);
    }
});

app.listen(port, () => console.log(`auroraOS started on port ${port}`));