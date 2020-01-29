;(async function(){
var package = os.runningPackages[document.currentScript.id];
var wRaw = await package.resource("main.html");
var window = package.createWindow(atob(wRaw), { resizable: true });

var mimeToMode = {
  "application/javascript": "javascript",
  "application/json": "json",
  "text/css": "css"
}

var mime = "application/javascript";
var content = "";
if (package.flags) { content = atob(package.flags.file); mime = package.flags.type}
document.getElementById(`${package.name}Text`).contentDocument.write(`<style>::-webkit-scrollbar{width:10px;height:10px;}::-webkit-scrollbar-thumb{background-color:rgba(255,255,255,0.5);border-radius:5px;}::-webkit-scrollbar-thumb:hover{background-color:rgba(3,169,255,0.5);}::-webkit-scrollbar-thumb:active{background-color:#004b8a;}</style><div id="editor" style="position:absolute;top:0;right:0;bottom:0;left:0;">${content}</div>`);

if (mimeToMode[mime] === "javascript") {
  document.getElementById(`${package.name}Run`).style = null;
  document.getElementById(`${package.name}Run`).onclick = function() {
    os.startPackage(os.packages.find(e => e.name === "Terminal"), document.getElementById(`${package.name}Text`).contentDocument.body.value);
  }
}

document.getElementById(`${package.name}Save`).onclick = function() {
  os.prompt("Please type in the path of where you want to save.", "Save", window.id, function(path) { os.filesystem.writeFile(path, document.getElementById(`${package.name}Text`).contentDocument.body.innerText); window.close(); });
}

var scriptA = document.createElement("script");
scriptA.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.7/ace.js";
document.getElementById(`${package.name}Text`).contentDocument.body.appendChild(scriptA);

var scriptB = document.createElement("script");
scriptB.innerHTML = `var editor = ace.edit("editor");editor.setTheme("ace/theme/monokai");editor.session.setMode("ace/mode/${mimeToMode[mime]}");setTimeout(function(){document.body.value=editor.getValue();document.querySelector("textarea").oninput=function(){document.body.value=document.querySelector("textarea").value;};},50);`;
setTimeout(function() { document.getElementById(`${package.name}Text`).contentDocument.body.appendChild(scriptB); }, 500)
})()