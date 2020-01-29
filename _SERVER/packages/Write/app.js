;(async function() {
var package = os.runningPackages[document.currentScript.id];
var mainWindowRaw = await package.resource("main.html");
package.createWindow(atob(mainWindowRaw), { resizable: true });

document.getElementById(`${package.name}Text`).src = "data:text/html;base64," + btoa(`<head><link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet"></head><body contenteditable></body>`);
var text = document.getElementById(`${package.name}Text`).contentWindow.document;
text.designMode = "on";

document.getElementById(`${package.name}Bold`).onmouseup = function() { text.execCommand("bold", false); }
document.getElementById(`${package.name}Italics`).onmouseup = function() { text.execCommand("italic", false); }
document.getElementById(`${package.name}Underline`).onmouseup = function() { text.execCommand("underline", false); }
document.getElementById(`${package.name}Strikethrough`).onmouseup = function() { text.execCommand("strikethrough", false); }
document.getElementById(`${package.name}Font`).oninput = function() { text.execCommand("fontName", false, document.getElementById(`${package.name}Font`).value); }
document.getElementById(`${package.name}FontSize`).oninput = function() { text.execCommand("fontSize", false, document.getElementById(`${package.name}FontSize`).value); }
document.getElementById(`${package.name}FormatBlock`).oninput = function() { text.execCommand("removeFormat"); text.execCommand("formatBlock", false, document.getElementById(`${package.name}FormatBlock`).value); }
document.getElementById(`${package.name}IndentLeft`).onmouseup = function() { text.execCommand("justifyLeft", false); }
document.getElementById(`${package.name}IndentCenter`).onmouseup = function() { text.execCommand("justifyCenter", false); }
document.getElementById(`${package.name}IndentRight`).onmouseup = function() { text.execCommand("justifyRight", false); }
document.getElementById(`${package.name}OrderedList`).onmouseup = function() { text.execCommand("insertOrderedList", false); }
document.getElementById(`${package.name}UnorderedList`).onmouseup = function() { text.execCommand("insertUnorderedList", false); }
})()