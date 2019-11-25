var text = document.getElementById("writeText");
text.contentWindow.document.designMode = "on";

document.getElementById("writeBold").onmouseup = function() { text.contentWindow.document.execCommand("bold", false); }
document.getElementById("writeItalics").onmouseup = function() { text.contentWindow.document.execCommand("italic", false); }
document.getElementById("writeUnderline").onmouseup = function() { text.contentWindow.document.execCommand("underline", false); }
document.getElementById("writeStrikethrough").onmouseup = function() { text.contentWindow.document.execCommand("strikethrough", false); }
document.getElementById("writeFont").oninput = function() { text.contentWindow.document.execCommand("fontName", false, document.getElementById("writeFont").value); }
document.getElementById("writeFontSize").oninput = function() { text.contentWindow.document.execCommand("fontSize", false, document.getElementById("writeFontSize").value); }
document.getElementById("writeFormatBlock").oninput = function() { text.contentWindow.document.execCommand("removeFormat"); text.contentWindow.document.execCommand("formatBlock", false, document.getElementById("writeFormatBlock").value); }
document.getElementById("writeIndentLeft").onmouseup = function() { text.contentWindow.document.execCommand("justifyLeft", false); }
document.getElementById("writeIndentCenter").onmouseup = function() { text.contentWindow.document.execCommand("justifyCenter", false); }
document.getElementById("writeIndentRight").onmouseup = function() { text.contentWindow.document.execCommand("justifyRight", false); }
document.getElementById("writeOrderedList").onmouseup = function() { text.contentWindow.document.execCommand("insertOrderedList", false); }
document.getElementById("writeUnorderedList").onmouseup = function() { text.contentWindow.document.execCommand("insertUnorderedList", false); }