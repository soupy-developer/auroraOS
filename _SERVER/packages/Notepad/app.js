;(async function() {
var package = os.runningPackages[document.currentScript.id];

var content = "";
if (package.flags) content = atob(package.flags);

var window = package.createWindow(`<div id="%window%TitleBar" class="windowTitleBar"><div id="%window%Close" class="windowAction"><img src="close.svg"></div><div id="%window%Maximize" class="windowAction"><img src="max.svg"></div><div id="%window%Minimize" class="windowAction"><img src="min.svg"></div><ui>Notepad</ui></div><div id="%window%Body" class="windowBody blur" style="padding:0;"><div class="menubar"><div id="%package%Save" class="menubarButton">Save</div></div><textarea style="width:100%;height:calc(100% - 57px);resize:none;border-radius:0;" id="%package%Text">${content}</textarea></div>`, { resizable: true });

document.getElementById(`${package.name}Save`).onclick = function() {
  os.prompt("Please type in the path of where you want to save.", "Save", window.id, function(path) { os.filesystem.writeFile(path, document.getElementById(`${package.name}Text`).value); window.close(); });
}
})()