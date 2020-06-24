;(async function() {
const package = document.currentScript.package;
package.createWindow(atob(await package.resource("main.html")), { startingDimensions: [500, 400], titleBar: "Default", title: "Write", minimizable: true, resizable: true });

document.getElementById(`${package.name}Text`).contentWindow.onload = async function() {
  const text = document.getElementById(`${package.name}Text`).contentDocument;
  document.getElementById(`${package.name}Bold`).onclick = function() { text.execCommand("bold", false); }
  document.getElementById(`${package.name}Italics`).onclick = function() { text.execCommand("italic", false); }
  document.getElementById(`${package.name}Underline`).onclick = function() { text.execCommand("underline", false); }
  document.getElementById(`${package.name}Strikethrough`).onclick = function() { text.execCommand("strikethrough", false); }
  document.getElementById(`${package.name}Font`).oninput = function() { text.execCommand("fontName", false, document.getElementById(`${package.name}Font`).value); }
  document.getElementById(`${package.name}FontSize`).oninput = function() { text.execCommand("fontSize", false, document.getElementById(`${package.name}FontSize`).value); }
  document.getElementById(`${package.name}FormatBlock`).oninput = function() { text.execCommand("removeFormat"); text.execCommand("formatBlock", false, document.getElementById(`${package.name}FormatBlock`).value); }
  document.getElementById(`${package.name}IndentLeft`).onclick = function() { text.execCommand("justifyLeft", false); }
  document.getElementById(`${package.name}IndentCenter`).onclick = function() { text.execCommand("justifyCenter", false); }
  document.getElementById(`${package.name}IndentRight`).onclick = function() { text.execCommand("justifyRight", false); }
  document.getElementById(`${package.name}OrderedList`).onclick = function() { text.execCommand("insertOrderedList", false); }
  document.getElementById(`${package.name}UnorderedList`).onclick = function() { text.execCommand("insertUnorderedList", false); }
}
})()