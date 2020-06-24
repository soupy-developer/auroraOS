;(async function() {
const package = document.currentScript.package;

var content = "";
if (package.flags) content = atob(package.flags[0]);

const window = package.createWindow(`<div id="%window%Body" class="windowBody" style="padding:0;"><div class="menubar"><div id="%package%Save" class="menubarButton">Save</div></div><textarea style="width:100%;height:calc(100% - 57px);resize:none;border-radius:0;" id="%package%Text">${content}</textarea></div>`, { titleBar: "Default", title: "Notepad", minimizable: true, resizable: true, startingDimensions: [400, 400] });

document.getElementById(`${package.name}Save`).onclick = function() {
  os.prompt("Please type in the path of where you want to save.", "Save", "File path", function(path) { os.filesystem.writeFile(path, document.getElementById(`${package.name}Text`).value); window.close(); });
}
})()