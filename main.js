var menubarSystem = document.getElementById("systemButton");
var apps = document.getElementById("applications");
var menubarClick = false;
var clockDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var clockMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var osContextMenu = document.getElementById("osContextMenu");

var windows = [
  document.getElementById("aboutWindow"),
  document.getElementById("terminalWindow"),
  document.getElementById("uiWindow"),
  document.getElementById("settingsWindow"),
  document.getElementById("writeWindow"),
  document.getElementById("calculatorWindow")
];

setInterval( function() {
	var date = new Date();
  var minute = date.getMinutes()
  if (minute < 10) minute = "0" + date.getMinutes();
	document.getElementById("menubarClock").innerHTML = clockDays[date.getDay()] + " " + clockMonths[date.getMonth()] + " " + date.getDate() + "<br>" + date.getHours() + ":" + minute;
}, 2000);

menubarSystem.addEventListener("click", function() {
  if (menubarClick) {
    menubarClick = false;
    menubarSystem.style = null;
    apps.style.transform = "scale(0)";
    apps.style.opacity = 0;
    setTimeout(function() {
      apps.style.display = "none";
    }, 100);
  } else {
    menubarClick = true;
    apps.style.display = null;
    setTimeout(function() {
      apps.style.transform = null;
      apps.style.opacity = null;
    }, 1);
    menubarSystem.style = "background-color:#004b8a";
  }
});

document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    osContextMenu.style.display = null;
    osContextMenu.style.top = (e.clientY - 20) + "px";
    osContextMenu.style.left = e.clientX + "px";
    setTimeout(function() {
      osContextMenu.style.top = e.clientY + "px";
    }, 1)
}, false);
document.addEventListener("mouseup", function() { osContextMenu.style = "display:none;position:fixed;" })

document.getElementById("systemShutdown").onclick = function() {
  document.getElementById("shutdown").style = null;
  setTimeout(function() {
    document.getElementById("shutdown").style = "transition:0.5s;background-color:black;width:100%;height:100%;position:absolute;z-index:256;";
  }, 1)
}

document.getElementById("systemReboot").onclick = function() {
  document.getElementById("systemShutdown").click();
  setTimeout(function() { location = location; }, 1000);
}

function windowEnable(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  var firstActivate = document.getElementById(elmnt.id + "Open")
  var secondActivate = null;
  var thirdActivate = null;
  var maximizer = null;
  var maximized = false;
  var width = null;
  var height = null;
  var top = null;
  var left = null;
  document.getElementById(elmnt.id + "Close").onclick= function() {
    elmnt.style.transition = null;
    elmnt.style.transform = "scale(0.1)";
    elmnt.style.opacity = 0;
    setTimeout(function() {
      elmnt.style = "display: none;";
    }, 200)
  }
  try {var secondActivate=document.getElementById(elmnt.id + "Open2");}catch(a){}
  try {var thirdActivate=document.getElementById(elmnt.id + "Open3");}catch(a){}
  try {var maximizer=document.getElementById(elmnt.id + "Maximize");}catch(a){}
  function maximize() {
    if (maximized == false) {
      maximized = true;
      width = document.getElementById(elmnt.id + "Body").style.width ? document.getElementById(elmnt.id + "Body").style.width : "300px";
      height = document.getElementById(elmnt.id + "Body").style.height ? document.getElementById(elmnt.id + "Body").style.height : "300px";
      top = elmnt.style.top;
      left = elmnt.style.left;
      elmnt.style.width = width;
      elmnt.style.height = height;
      document.getElementById(elmnt.id + "Body").style.resize = "none";
      document.getElementById(elmnt.id + "Body").style.height = null;
      document.getElementById(elmnt.id + "Body").style.width = null;
      elmnt.style.transition = "0.5s"
      setTimeout(function() {
        elmnt.style.top = "0";
        elmnt.style.left = "0";
        elmnt.style.width = "100%";
        elmnt.style.height = "calc(100vh - 100px)";
        setTimeout(function() {elmnt.style.transition = "none";}, 500);
      }, 1)
    } else {
      document.getElementById(elmnt.id + "Body").style.resize = null;
      elmnt.style.transition = "0.5s";
      setTimeout(function() {
        elmnt.style.width = width;
        elmnt.style.height = height;
        elmnt.style.top = top;
        elmnt.style.left = left;
        setTimeout(function() {elmnt.style.transition = "none";elmnt.style.height = null;elmnt.style.width = null;document.getElementById(elmnt.id + "Body").style.height = height;document.getElementById(elmnt.id + "Body").style.width = width;maximized = false;}, 500);
      }, 1)
    }
  }
  if (maximizer) { maximizer.addEventListener("click", maximize); document.getElementById(elmnt.id + "TitleBar").addEventListener("dblclick", maximize); }
  function openWindow() {
    if (maximizer) document.getElementById(elmnt.id + "Body").style.resize = null;
    if (maximized) maximized = false;
    if (apps.style.display !== "none") document.getElementById("systemButton").click();
    elmnt.style = "top: 30px;";
    windows.forEach(window => window.style.zIndex = 1);
    elmnt.style.zIndex = 2;
    setTimeout(function() {
      elmnt.style.top = "50px";
    }, 1)
    setTimeout(function() {
      elmnt.style.transition = "none";
    }, 100)
  }
  firstActivate.addEventListener("click", openWindow)
  if (secondActivate) secondActivate.addEventListener("click", openWindow);
  if (thirdActivate) thirdActivate.addEventListener("click", openWindow);
  document.getElementById(elmnt.id + "TitleBar").onmousedown = function(e) {
    if (maximized == false) {
      e = e || window.event;
      pos3 = e.clientX;
      pos4 = e.clientY;
      windows.forEach(window => window.style.zIndex = 1);
      elmnt.style.zIndex = 2;
      document.onmouseup = function() {document.onmouseup = null; document.onmousemove = null;};
      document.onmousemove = function(e) {
        e = e || window.event;
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        e.preventDefault();
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }
    }
  }
}

windows.forEach(window => windowEnable(window));

document.getElementById("closeAllWindows").onmouseup = function() { windows.forEach(window => document.getElementById(window.id + "Close").click()) }

window.alert = function(window, message, title="Alert") {
  var windowObject = document.getElementById(window.toLowerCase() + "Window");
  document.getElementById("alertTitleBar").innerHTML = window;
  document.getElementById("alertTitle").innerHTML = title;
  document.getElementById("alertMessage").innerHTML = message;
  document.getElementById("alert").style.display = null;
  document.getElementById("alert").style.left = windowObject.style.left;
  document.getElementById("alert").style.top = parseInt(windowObject.style.top.substring(0, windowObject.style.top.length - 2)) - 20 + "px";
  setTimeout(function() { document.getElementById("alert").style.top = windowObject.style.top; }, 1);
}

window.onload = function() { // executes after everything executed & resources finished loading - KEEP THIS AT BOTTOM
  document.body.removeChild(document.getElementById("startup"));
  document.getElementById("shutdown").style = "background-color:black;width:100%;height:100%;position:fixed;z-index:256;";
  setTimeout(function() {
    document.getElementById("shutdown").style = "transition:0.5s;margin:50%;margin-top:25%;width:0%;height:0%;position:fixed;";
    setTimeout(function(){document.getElementById("shutdown").style = "display: none;"},500)
  }, 1000)
}