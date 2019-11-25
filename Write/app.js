var text = document.getElementById("writeText");
text.contentWindow.document.designMode = "on";

document.getElementById("writeBold").onmouseup = function() { text.contentWindow.document.execCommand("bold"); }
document.getElementById("writeItalics").onmouseup = function() { text.contentWindow.document.execCommand("italic"); }
document.getElementById("writeUnderline").onmouseup = function() { text.contentWindow.document.execCommand("underline"); }