;(async function(){
const package = document.currentScript.package;
const window = package.createWindow(atob(await package.resource("main.html")), { resizable: true, minimizable: true, titleBar: "Default", title: "Files", startingDimensions: [500, 400] })

const fileList = document.getElementById(`${package.name}FileList`);
const dirBox = document.getElementById(`${package.name}Directory`);

var currentDirectory = "/home";

const contextMenu = package.createContextMenu(fileList, [
  {
    name: "Open",
    disabled: true
  },
  {
    name: "Edit",
    disabled: true
  },
  {
    name: "Delete...",
    disabled: true
  },
  {
    name: "Download",
    disabled: true
  },
  { type: "separator" },
  {
    name: "Refresh",
    activate: function() { readDirectory(currentDirectory); }
  },
  {
    name: "New file...",
    activate: function() {
      os.prompt("", "Create file", "Name and extension of file", async function(name) {
        const result = await os.filesystem.writeFile(currentDirectory + "/" + name, "");
        if (result === "Denied") return os.alert("You do not have permission to create files in this folder.", "Write Error");
        readDirectory(currentDirectory);
      });
    }
  },
  {
    name: "New folder...",
    activate: function() {
      os.prompt("", "Create folder", "Name of folder", async function(name) {
        const result = await os.filesystem.writeDirectory(currentDirectory + "/" + name);
        if (result === "Denied") return os.alert("You do not have permission to create subfolders of this folder.", "Write Error");
        readDirectory(currentDirectory);
      });
    }
  }], function(e) {
  const target = e.target.parentNode;
  if (target.id === "Entry") {
    contextMenu.disableItem(contextMenu["Open"], false); contextMenu["Open"].onclick = function() { const f = fileActions[target.dataset.type] ? fileActions[target.dataset.type] : fileActions["file"]; f(target.dataset); };
    contextMenu.disableItem(contextMenu["Delete..."], false);
    contextMenu["Delete..."].onclick = function() {
      os.prompt("Are you sure you want to delete this?", "Delete", "", async function() {
        if (target.dataset.type === "directory") {
          const result = await os.filesystem.deleteDirectory(target.dataset.path);
          if (result === true) readDirectory(currentDirectory); else return os.alert("Not allowed to delete this directory.", "Delete Error")
        } else {
          const result = await os.filesystem.deleteFile(target.dataset.path);
          if (result === true) readDirectory(currentDirectory); else return os.alert("Not allowed to delete this file.", "Delete Error");
        }
      }, false);
    };
    if (target.dataset.type !== "directory") {
      contextMenu.disableItem(contextMenu["Edit"], false); contextMenu["Edit"].onclick = function() { const f = fileActions["file"]; f(target.dataset); };
      contextMenu.disableItem(contextMenu["Download"], false);
      contextMenu["Download"].onclick = async function() {
        const result = await os.filesystem.readFile(target.dataset.path);
        if (result === false) return os.alert("Not allowed to download this file.", "Read Error");
        const element = document.createElement("a");
        element.href = "data:text/plain;base64," + result;
        element.download = target.dataset.name;
        document.body.appendChild(element);
        element.click(); element.remove();
      };
    } else {
      contextMenu["Edit"].onclick = null; contextMenu.disableItem(contextMenu["Edit"], true);
      contextMenu["Download"].onclick = null; contextMenu.disableItem(contextMenu["Download"], true);
    };
  } else {
    contextMenu["Delete..."].onclick = null; contextMenu.disableItem(contextMenu["Delete..."], true);
    contextMenu["Edit"].onclick = null; contextMenu.disableItem(contextMenu["Edit"], true); 
    contextMenu["Download"].onclick = null; contextMenu.disableItem(contextMenu["Download"], true);
    contextMenu["Open"].onclick = null;  contextMenu.disableItem(contextMenu["Open"], true);
  }
});

package.close = function() {
  contextMenu.remove();
};
  
const customMimes = {
  ".exec": "auroraos/executable"
};

const fileIcons = {
  "file": "file.webp",
  "directory": "directory.webp",
  "application/javascript": "javascript.webp",
  "text/html": "html.webp",
};

const fileActions = {
  "directory": function(item) { readDirectory(item.path); },
  "file": async function(item) { os.startPackage(os.packages.find(p => p.name === "Notepad"), [await os.filesystem.readFile(item.path), item.path]); },
  "text/html": async function(item) { os.startPackage(os.packages.find(p => p.name === "HTML Viewer"), await os.filesystem.readFile(item.path)); },
  "auroraos/executable": async function(item) { eval(atob(await os.filesystem.readFile(item.path))); }
};

const readDirectory = async function(path) {
  window.style.cursor = "progress";
  if (path.includes("./")) path = "/";
  if (!path.includes("/")) path = "/" + path;
  const list = await os.filesystem.readDirectory(path);
  if (list === false) { window.style.cursor = null; return os.alert("Not allowed to read the contents of this folder.", "Read Error"); };
  currentDirectory = path;
  dirBox.value = path;
  fileList.innerHTML = "<item style='background:transparent;font-weight:bold;color:inherit;'><itemcell>Name</itemcell><itemcell>Type</itemcell></item>";
  if (path !== "/") list.unshift({name: "..", type: "directory", path: path.slice(0, path.lastIndexOf("/"))});
  list.forEach(entry => {
    const item = document.createElement("item");
    item.tabIndex = "0";
    item.dataset.name = entry.name;
    item.dataset.path = entry.path;
    item.dataset.extension = entry.extension;
    if (entry.name !== "..") item.id = "Entry"; else item.id = "Up";
    if (entry.type) item.dataset.type = entry.type; else if (customMimes[item.dataset.extension]) item.dataset.type = customMimes[item.dataset.extension]; else item.dataset.type = "file";
    item.ondblclick = function() { const f = fileActions[item.dataset.type] ? fileActions[item.dataset.type] : fileActions["file"]; f(item.dataset); };
    
    const image = document.createElement("img");
    image.src = "/file/readStatic/packages%2FFiles%2Fthumbs%2F" + (fileIcons[item.dataset.type] ? fileIcons[item.dataset.type] : fileIcons["file"]);
    image.style = "height:20px;margin-right:10px;vertical-align:middle;";
    const nameCell = document.createElement("itemcell");
    nameCell.appendChild(image);
    nameCell.innerHTML += item.dataset.name;
    const typeCell = document.createElement("itemcell");
    typeCell.innerText = item.id ? item.dataset.type : "";
    
    item.appendChild(nameCell);
    item.appendChild(typeCell);
    fileList.appendChild(item);
  });
  window.style.cursor = null;
}

readDirectory(currentDirectory);

dirBox.addEventListener("keypress", e => { if (e.keyCode === 13) readDirectory(dirBox.value) });

})()