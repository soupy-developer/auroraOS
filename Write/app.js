var text = document.getElementById("writeText");
text.contentWindow.document.designMode = "on";

document.getElementById("writeBold").onmouseup = function() { text.contentWindow.document.execCommand("bold"); }
document.getElementById("writeItalics").onmouseup = function() { text.contentWindow.document.execCommand("italics"); }
document.getElementById("writeUnderline").onmouseup = function() { text.contentWindow.document.execCommand("underline"); }

setInterval(function() {
  if (text.contentWindow.document.body.scrollHeight > 1000) {
    text.style.height = text.contentWindow.document.body.scrollHeight + "px";
  } else {
    text.style.height = "1000px";
  }
}, 500)