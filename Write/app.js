var text = document.getElementById("writeText").contentWindow.document;
text.designMode = "on";

document.getElementById("writeBold").onmouseup = function() { text.execCommand("bold", false); }
document.getElementById("writeItalics").onmouseup = function() { text.execCommand("italic", false); }
document.getElementById("writeUnderline").onmouseup = function() { text.execCommand("underline", false); }
document.getElementById("writeStrikethrough").onmouseup = function() { text.execCommand("strikethrough", false); }
document.getElementById("writeFont").oninput = function() { text.execCommand("fontName", false, document.getElementById("writeFont").value); }
document.getElementById("writeFontSize").oninput = function() { text.execCommand("fontSize", false, document.getElementById("writeFontSize").value); }
document.getElementById("writeFormatBlock").oninput = function() { text.execCommand("removeFormat"); text.execCommand("formatBlock", false, document.getElementById("writeFormatBlock").value); }
document.getElementById("writeIndentLeft").onmouseup = function() { text.execCommand("justifyLeft", false); }
document.getElementById("writeIndentCenter").onmouseup = function() { text.execCommand("justifyCenter", false); }
document.getElementById("writeIndentRight").onmouseup = function() { text.execCommand("justifyRight", false); }
document.getElementById("writeOrderedList").onmouseup = function() { text.execCommand("insertOrderedList", false); }
document.getElementById("writeUnorderedList").onmouseup = function() { text.execCommand("insertUnorderedList", false); }