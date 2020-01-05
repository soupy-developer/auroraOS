var menubarSystem = document.getElementById("systemButton");
var apps = document.getElementById("applications");
var menubarClick = false;
var clockDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var clockMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var osContextMenu = document.getElementById("osContextMenu");

String.prototype.replaceAll = function(f,r){return this.split(f).join(r);}

var os = {
  alert: function(message, title="Alert", window="Alert", callback) {
    var alert = document.getElementById("Alert").cloneNode(true);
    alert.id += Math.random().toString();
    alert.innerHTML = alert.innerHTML.replaceAll("%window%", alert.id);
    alert.style.opacity = 0;
    alert.style.transform = "scale(0.75)";
    document.body.appendChild(alert);
    setTimeout(function() { alert.style.opacity = 1; alert.style.transform = "scale(1)"; }, 5);
    windowEnable(alert);
    alert.style.display = null;
    if (!(window === "Alert")) {
      var windowObject = document.getElementById(window);
      alert.style.left = windowObject.style.left;
      alert.style.top = windowObject.style.top;
    }
    setTimeout(function() { alert.style.transition = "none"; }, 200);
    document.getElementById(`${alert.id}TitleBar`).innerHTML = title;
    document.getElementById(`${alert.id}Title`).innerHTML = title;
    document.getElementById(`${alert.id}Message`).innerHTML = message;
    alert.style.zIndex = 200;
    document.getElementById(`${alert.id}Close`).onmouseup = function() { callback(); };
  },
  prompt: function(message, title="Prompt", window="Prompt", callback, showTextBox=true) {
    var prompt = document.getElementById("Prompt").cloneNode(true);
    prompt.id += Math.random().toString();
    prompt.innerHTML = prompt.innerHTML.replaceAll("%window%", prompt.id);
    prompt.style.display = null;
    prompt.style.opacity = 0;
    prompt.style.transform = "scale(0.75)";
    document.body.appendChild(prompt);
    windowEnable(prompt);
    setTimeout(function() { prompt.style.opacity = null; prompt.style.transform = null; }, 5);
    if (!(window === "Prompt")) {
      var windowObject = document.getElementById(window);
      prompt.style.left = windowObject.style.left;
      prompt.style.top = windowObject.style.top;
    }
    if (showTextBox) { document.getElementById(`${prompt.id}Input`).style.display = null; document.getElementById(`${prompt.id}Input`).placeholder = title; }
    setTimeout(function() { prompt.style.transition = "none"; }, 200);
    document.getElementById(`${prompt.id}TitleBar`).innerHTML = title;
    document.getElementById(`${prompt.id}Title`).innerHTML = title;
    document.getElementById(`${prompt.id}Message`).innerHTML = message;
    document.getElementById(`${prompt.id}OK`).onmouseup = function() { callback(document.getElementById(`${prompt.id}Input`).value); prompt.close(); };
  },
  runningPackages: {},
  startPackage: async function(package, flags) {
    document.body.className = "loading";
    var packageRaw = await fetch(`/packages/start/${package.name}`);
    var packageJS = await packageRaw.json();
    var packagee = Object.assign({}, package);
    packagee.name += Math.random().toString();
    packagee.absoluteName = package.name;
    packagee.event = new Event(packagee.name + "Close");
    packagee.windows = [];
    if (packagee.isApp) {
      packagee.dockIcon = document.createElement("img");
      packagee.dockIcon.style = "transform:scale(0);width:0px;height:15px;";
      packagee.dockIcon.src = `data:image/webp;base64,${package.icon}`;
      document.getElementById("dockDisplay").appendChild(packagee.dockIcon);
      setTimeout(function() {
        packagee.dockIcon.onclick = function() { if (packagee.windows[0].style.display !== null) packagee.windows.forEach(window => window.minimize()); };
        packagee.dockIcon.style = null;
      }, 5);
    };
    var script = document.createElement("script");
    script.src = "data:text/javascript;base64," + packageJS;
    script.id = packagee.name;
    script.defer = true;
    packagee.flags = flags;
    document.body.appendChild(script);
    packagee.script = script;
    os.runningPackages[packagee.name] = packagee;
    packagee.createWindow = function(body) {
      var window = document.createElement("div");
      window.id = packagee.name + "Window" + Math.random().toString();
      window.className += "window";
      window.innerHTML = body.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, window.id);
      window.style = "opacity:0;transform:scale(0.75);";
      document.body.appendChild(window);
      setTimeout(function() { window.style = null;}, 5);
      setTimeout(function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); }); window.style.transition = "none"; window.style.zIndex = 2; }, 200)
      windowEnable(window, packagee);
      if (menubarClick) menubarSystem.click();
      window.edit = function(body) { window.innerHTML = body.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, window.id); };
      window.body = document.getElementById(`${window.id}Body`);
      packagee.windows.push(window);
      return window;
    };
    packagee.resource = async function(filePath) {
      var fileRaw = await fetch(`/packages/resources/${packagee.absoluteName}/${filePath}`);
      return await fileRaw.json();
    };
    document.body.className = null;
  },
  stopPackage: function(package) {
    if (package.isApp) package.dockIcon.style = "transform:scale(0);width:0px;height:15px;";
    if (package.close) package.close();
    setTimeout(function() {
      if (package.isApp) document.getElementById("dockDisplay").removeChild(package.dockIcon);
      document.body.removeChild(package.script);
      delete os.runningPackages[package.name];
    }, 500)
  },
  filesystem: {
    readDirectory: async function(path) {
      if (path.includes("./")) path = "$$$$";
      path = path.replaceAll("/", "$$$$");
      var raw = await fetch(`/file/read/directory/${path}`);
      var dir = await raw.json();
      return dir;
    },
    readFile: async function(path) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "$$$$");
      var raw = await fetch(`/file/read/file/${path}`);
      var file = await raw.json();
      return file;
    },
    writeDirectory: function(path) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "$$$$");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `/file/write/directory/${path}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ data: null }));
    },
    writeFile: function(path, data) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "$$$$");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `/file/write/file/${path}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ data: btoa(data) }));
    },
    deleteDirectory: function(path) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "$$$$");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `/file/rm/directory/${path}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ data: null }));
    },
    deleteFile: function(path) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "$$$$");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `/file/rm/file/${path}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ data: null }));
    },
  }
};

async function loadPackages() {
  var packages = await fetch("/packages");
  os.packages = await packages.json();
  var icon = await fetch("/packages/icons");
  var icons = await icon.json();
  os.packages.forEach(async function(package, index) {
    if (package.startOnBoot) os.startPackage(package);
    if (package.isApp) {
      document.getElementById("appsDisplay").innerHTML += `<div><img id="${package.name}Start" src="data:image/webp;base64,${icons[index]}"><br>${package.name}</div>`;
      package.icon = await icons[index];
      document.getElementById(`${package.name}Start`).onmousedown = function() { os.startPackage(package); };
    };
  });
}; loadPackages();

setInterval( function() {
	var date = new Date();
  var minute = date.getMinutes()
  if (minute < 10) minute = "0" + minute;
	document.getElementById("menubarClock").innerHTML = clockDays[date.getDay()] + " " + clockMonths[date.getMonth()] + " " + date.getDate() + "<br>" + date.getHours() + ":" + minute;
}, 2000);

menubarSystem.addEventListener("click", function() {
  if (menubarClick) {
    menubarClick = false;
    apps.style.transform = "scale(0)";
    apps.style.opacity = 0;
    apps.style.top = null;
    setTimeout(function() {
      apps.style.display = "none";
    }, 100);
  } else {
    menubarClick = true;
    apps.style.display = null;
    setTimeout(function() {
      apps.style.transform = null;
      apps.style.opacity = null;
      apps.style.top = "0";
    }, 1);
  }
});

document.addEventListener("contextmenu", function(e) {
  if (e.defaultPrevented) return;
  e.preventDefault();
  osContextMenu.style.display = null;
  osContextMenu.style.top = (e.clientY - 20) + "px";
  osContextMenu.style.left = e.clientX + "px";
  setTimeout(function() {
    osContextMenu.style.top = e.clientY + "px";
  }, 1)
}, false);
document.addEventListener("mouseup", function() { osContextMenu.style = "display:none;" })

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

function windowEnable(elmnt, package) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  var maximizer = null;
  var maximized = false;
  var minimizer = null;
  elmnt.minimized = false;
  var width = null;
  var height = null;
  var top = null;
  var left = null;
  try {var maximizer=document.getElementById(elmnt.id + "Maximize");}catch(a){}
  try {var minimizer=document.getElementById(elmnt.id + "Minimize");}catch(a){}
  elmnt.close = function() { document.getElementById(elmnt.id + "Close").click(); };
  elmnt.maximize = maximize;
  elmnt.minimize = minimize;
  document.getElementById(elmnt.id + "Close").onclick = function() {
    elmnt.style.transition = null;
    elmnt.style.transform = "scale(0.75)";
    elmnt.style.opacity = 0;
    if (package) if (package.windows[0].id == elmnt.id) os.stopPackage(package);
    setTimeout(function() { document.body.removeChild(elmnt); }, 200)
  }
  function minimize() {
    if (elmnt.minimized == false) {
      top = elmnt.style.top;
      elmnt.minimized = true;
      elmnt.style.transition = null;
      elmnt.style.transform = "scale(0.75)";
      elmnt.style.opacity = 0;
      setTimeout(function() { elmnt.style.display = "none"; }, 200)
    } else {
      elmnt.minimized = false;
      elmnt.style.display = null;
      setTimeout(function() { elmnt.style.opacity = null; elmnt.style.transform = null; }, 5);
      setTimeout(function() { elmnt.style.transition = "none"; }, 200);
      Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); });
      elmnt.style.zIndex = 2;
    }
  }
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
      elmnt.style.transition = "0.4s";
      setTimeout(function() {
        elmnt.style.top = "0";
        elmnt.style.left = "0";
        elmnt.style.width = "100%";
        elmnt.style.height = "calc(100vh - 100px)";
        setTimeout(function() { elmnt.style.transition = "none"; }, 500);
      }, 1)
    } else {
      document.getElementById(elmnt.id + "Body").style.resize = null;
      elmnt.style.transition = "0.4s";
      setTimeout(function() {
        maximized = false;
        elmnt.style.width = width;
        elmnt.style.height = height;
        elmnt.style.top = top;
        elmnt.style.left = left;
        setTimeout(function() {elmnt.style.transition = "none";elmnt.style.height = null;elmnt.style.width = null;document.getElementById(elmnt.id + "Body").style.height = height;document.getElementById(elmnt.id + "Body").style.width = width;}, 500);
      }, 1)
    }
  }
  if (maximizer) { maximizer.addEventListener("click", maximize); document.getElementById(elmnt.id + "TitleBar").addEventListener("dblclick", maximize); }
  if (minimizer) minimizer.addEventListener("click", minimize);
  document.getElementById(elmnt.id + "TitleBar").onmousedown = function(e) {
    if (maximized == false) {
      e = e || window.event;
      pos3 = e.clientX;
      pos4 = e.clientY;
      Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); });
      elmnt.style.zIndex = 2;
      document.onmouseup = function() {document.onmouseup = null; document.onmousemove = null;};
      document.onmousemove = function(e) {
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

document.getElementById("StopAllProcesses").onclick = function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.close()); }); }
document.getElementById("MinimizeAllWindows").onclick = function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.minimize()); }); }

//BEGIN SETTINGS LOAD
if (window.localStorage.getItem("theme")) os.filesystem.readFile(window.localStorage.getItem("theme")).then(theme => document.getElementById("STYLE_Theme").href = `data:text/css;base64,${theme}`);
if (window.localStorage.getItem("bgURL")) {
  var bgURLStyle = document.createElement("style");
  bgURLStyle.id = "STYLE_Wallpaper";
  document.head.appendChild(bgURLStyle);
  bgURLStyle.sheet.insertRule("body{background-image:url('" + window.localStorage.getItem("bgURL") + "')}")
};
//END SETTINGS LOAD

window.onload = function() {
  document.body.removeChild(document.getElementById("startup"));
  document.getElementById("shutdown").style = "background-color:black;width:100%;height:100%;position:fixed;z-index:256;";
  setTimeout(function() {
    document.getElementById("shutdown").style = "transition:0.5s;margin:50%;margin-top:25%;width:0%;height:0%;position:fixed;";
    setTimeout(function(){document.getElementById("shutdown").style = "display: none;"},500)
  }, 500)
}