;(async function(){
var package = os.runningPackages[document.currentScript.id];
var mainWindowRaw = await package.resource("main.html");

var bodyContextMenu = document.createElement("div");
bodyContextMenu.id = `${package.name}ContextMenu`;
bodyContextMenu.className = "contextMenu blur";
bodyContextMenu.style = "display:none;";
bodyContextMenu.innerHTML = `<div id="${package.name}Folder" class="contextMenuSelection">Create folder</div><div id="${package.name}File" class="contextMenuSelection">Create file</div>`;
document.body.appendChild(bodyContextMenu);

package.close = function() { document.body.removeChild(bodyContextMenu); };

var window = package.createWindow(atob(mainWindowRaw), { resizable: true });

window.body.addEventListener("contextmenu", function(e) {
  if (e.defaultPrevented) return;
  e.preventDefault();
  bodyContextMenu.style.display = null;
  bodyContextMenu.style.top = (e.clientY - 20) + "px";
  bodyContextMenu.style.left = e.clientX + "px";
  setTimeout(function() {
    bodyContextMenu.style.top = e.clientY + "px";
  }, 1)
}, false);

document.addEventListener("mouseup", function(e) { if (e.button === 0) bodyContextMenu.style = "display:none;" })

var fileIcons = {
  "file": "file.webp",
  "directory": "directory.webp",
  "application/javascript": "javascript.webp",
  "text/html": "html.webp",
};

var fileList = document.getElementById(`${package.name}FileList`);
var dirBox = document.getElementById(`${package.name}Directory`);

var readDirectory = async function(path) {
  if (path.includes("./")) path = "/";
  if (!path.includes("/")) path = "/" + path;
  document.getElementById(`${package.name}Folder`).onclick = function() { os.prompt("Please enter the name of the folder you want to create.", "Create Folder", window.name, function(name) { os.filesystem.writeDirectory(path + "/" + name); readDirectory(path); }); };
  document.getElementById(`${package.name}File`).onclick = function() { os.prompt("Please enter the name and extension of the file you want to create.", "Create File", window.name, function(name) { os.filesystem.writeFile(path + "/" + name, "", ""); readDirectory(path); }); };
  var list = await os.filesystem.readDirectory(path);
  fileList.innerHTML = "";
  dirBox.value = path;
  if (path !== "/") list.unshift({name: "..", type: "directory", path: path.slice(0, path.lastIndexOf("/"))});
  list.forEach(item => {
    var html = document.createElement("button");
    html.style = "width:100%;text-align:left;margin:0;padding:0;padding-left:10px;padding-right:10px;";
    if (item.path.substring(0, 2) === "//") item.path = "" + item.path.substring(2);
    // START FILE ACTIONS
    if (item.type === null) item.type = "file";
    if (item.type === "directory") html.onclick = function() { readDirectory(item.path); }; else html.onclick = async function() { os.startPackage(os.packages.find(e => e.name === "Notepad"), await os.filesystem.readFile(item.path)); };
    if (item.name.includes(".exec")) html.onclick = async function() { os.startPackage(os.packages.find(e => e.name === "Terminal"), atob(await os.filesystem.readFile(item.path))); };
    if (["application/javascript", "application/json", "text/css"].includes(item.type)) html.onclick = async function() { os.startPackage(os.packages.find(e => e.name === "Ace"), {file: await os.filesystem.readFile(item.path), type: item.type}); };
    if (item.type === "text/html") html.onclick = async function() { os.startPackage(os.packages.find(e => e.name === "HTML Viewer"), await os.filesystem.readFile(item.path)); };
    // END FILE ACTIONS
    html.innerHTML += `<img src="/file/readStatic/packages%2FFiles%2FfileIcons%2F${fileIcons[item.type] ? fileIcons[item.type] : fileIcons["file"]}" style="float:left;height:2.4rem;width:2.5rem;margin-right:1rem;margin-top:0.5rem;"><p style="float:left;">${item.name}</p> <p style="float:right;">${item.type}</p>`;
    fileList.appendChild(html);
  });
}

readDirectory("/home");

dirBox.addEventListener("keypress", e => { if (e.keyCode === 13) readDirectory(dirBox.value) });

})()