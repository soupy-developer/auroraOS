;(function(){
var package = os.runningPackages[document.currentScript.id];
var content = "";
if (package.flags) { content = package.flags; }
package.createWindow(`<div id="%window%TitleBar" class="windowTitleBar"><div id="%window%Close" class="windowAction"><img src="close.svg"></div><div id="%window%Maximize" class="windowAction"><img src="max.svg"></div><div id="%window%Minimize" class="windowAction"><img src="min.svg"></div><ui>Terminal</ui></div> <div id="%window%Body" class="windowBody blur" style="padding:0;"> <button id="%package%Evaluate" style="width:calc(100% - 10px);margin-left:5px;margin-right:5px;" onclick="document.getElementById('%package%Output').innerHTML = '⮞ ' + eval(document.getElementById('%package%Code').value)">Evaluate</button> <br> <textarea autocomplete="a" id="%package%Code" style="width:100%;height:calc(100% - 57px);resize:none;border-radius:0;font-family:monospace;margin-top:5px;">${content}</textarea><div id="%package%Output" style="width:calc(100% - 10px);margin-left:5px;margin-right:5px;">&#11166;</div></div>`, { resizable: true });
if (package.flags) document.getElementById(`${package.name}Evaluate`).click();
})()