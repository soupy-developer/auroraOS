if (location.protocol !== "https:") location.href = "https:" + window.location.href.substring(window.location.protocol.length);

var menubarSystem = document.getElementById("systemButton");
var apps = document.getElementById("applications");
var menubarClick = false;
var clockDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var clockMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var osContextMenu = document.getElementById("osContextMenu");
var loading = document.getElementById("menubarLoading");

String.prototype.replaceAll = function(f,r) { return this.split(f).join(r); } 

var os = {
  alert: function(message, title="Alert", window="Alert", callback) {
    var alert = document.getElementById("Alert").cloneNode(true);
    alert.id += Math.random().toString();
    alert.innerHTML = alert.innerHTML.replaceAll("%window%", alert.id);
    alert.style.opacity = 0;
    alert.style.transform = "scale(0.75)";
    alert.style.display = null;
    if (window !== "Alert") {
      var windowObject = document.getElementById(window);
      alert.style.left = windowObject.style.left;
      alert.style.top = windowObject.style.top;
    }
    alert.style.zIndex = 200;
    if (callback) document.getElementById(`${alert.id}Close`).onmouseup = function() { callback(); };
    document.body.appendChild(alert);
    document.getElementById(`${alert.id}TitleBar`).innerHTML = title;
    document.getElementById(`${alert.id}Title`).innerHTML = title;
    document.getElementById(`${alert.id}Message`).innerHTML = message;
    setTimeout(function() { alert.style.opacity = 1; alert.style.transform = "scale(1)"; }, 5);
    setTimeout(function() { alert.style.transition = "none"; }, 200);
    windowEnable(alert);
  },
  prompt: function(message, title="Prompt", window="Prompt", callback) {
    var prompt = document.getElementById("Prompt").cloneNode(true);
    prompt.id += Math.random().toString();
    prompt.innerHTML = prompt.innerHTML.replaceAll("%window%", prompt.id);
    prompt.style.display = null;
    prompt.style.opacity = 0;
    prompt.style.transform = "scale(0.75)";
    if (!(window === "Prompt")) {
      var windowObject = document.getElementById(window);
      prompt.style.left = windowObject.style.left;
      prompt.style.top = windowObject.style.top;
    }
    document.body.appendChild(prompt);
    document.getElementById(`${prompt.id}OK`).onmouseup = function() { callback(document.getElementById(`${prompt.id}Input`).value); prompt.close(); };
    document.getElementById(`${prompt.id}Input`).placeholder = title;
    document.getElementById(`${prompt.id}TitleBar`).innerHTML = title;
    document.getElementById(`${prompt.id}Title`).innerHTML = title;
    document.getElementById(`${prompt.id}Message`).innerHTML = message;
    windowEnable(prompt);
    setTimeout(function() { prompt.style.opacity = null; prompt.style.transform = null; }, 5);
    setTimeout(function() { prompt.style.transition = "none"; }, 200);
  },
  runningPackages: {},
  startPackage: async function(package, flags) {
    loading.style.display = null;
    var packageJS = await os.filesystem.readFile(`/packages/${package.name}/app.js`);
    var packagee = Object.assign({}, package);
    packagee.name += Math.random().toString();
    packagee.absoluteName = package.name;
    packagee.flags = flags;
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
    document.body.appendChild(script);
    packagee.script = script;
    os.runningPackages[packagee.name] = packagee;
    packagee.createWindow = function(body, options={}) {
      var window = document.createElement("div");
      window.id = packagee.name + "Window" + Math.random().toString();
      window.className += "window";
      window.innerHTML = body.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, window.id);
      window.style = "opacity:0;transform:scale(0.75);";
      document.body.appendChild(window);
      if (menubarClick) menubarSystem.click();
      setTimeout(function() { window.style = null; }, 5);
      setTimeout(function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); }); window.style.transition = "none"; window.style.zIndex = 2; }, 200)
      if (options.resizable === true) window.resizable = true;
      windowEnable(window, packagee);
      window.edit = function(body) { document.getElementById(`${window.id}Body`).outerHTML = body.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, window.id); };
      window.body = document.getElementById(`${window.id}Body`);
      packagee.windows.push(window);
      setTimeout(function() { if (options.startingDimensions) window.style += `;width:${options.startingDimensions[0]}px;height:${options.startingDimensions[1]}px;`; }, 50)
      return window;
    };
    packagee.resource = async function(filePath) { return await os.filesystem.readFile(`/packages/${packagee.absoluteName}/${filePath}`); };
    loading.style.display = "none";
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
      if (path.includes("./")) path = "/";
      path = path.replaceAll("/", "$$$$");
      var raw = await fetch(`/file/read/directory/${path}`);
      var dir = await raw.json();
      return dir;
    },
    readFile: async function(path) {
      loading.style.display = null;
      if (path.includes("./")) return;
      path = path.replaceAll("/", "$$$$");
      var raw = await fetch(`/file/read/file/${path}`);
      var file = await raw.json();
      loading.style.display = "none";
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

setInterval(function() {
	var date = new Date();
  var minute = date.getMinutes()
  if (minute < 10) minute = "0" + minute;
	document.getElementById("menubarClock").innerHTML = clockDays[date.getDay()] + " " + clockMonths[date.getMonth()] + " " + date.getDate() + "<br>" + date.getHours() + ":" + minute;
}, 2000);

menubarSystem.addEventListener("click", function() {
  if (menubarClick) {
    menubarClick = false;
    apps.style.bottom = null;
    apps.style.opacity = 0;
    setTimeout(function() {
      apps.style.display = "none";
    }, 200);
  } else {
    menubarClick = true;
    apps.style.display = null;
    setTimeout(function() {
      apps.style.bottom = "55px";
      apps.style.opacity = 1;
      document.getElementById("appSearch").value = null;
      document.getElementById("appSearch").focus();
    }, 1);
  }
});

document.onkeydown = function(e) { if (e.keyCode === 19) { menubarSystem.click(); } }

var entered = false;
document.getElementById("appSearch").onkeyup = function(e) {
  var div = document.getElementById("appsDisplay").getElementsByTagName("div");
  for (var i = 0; i < div.length; i++) {
    if (div[i].innerText.toUpperCase().indexOf(document.getElementById("appSearch").value.toUpperCase()) > -1) {
      div[i].style.display = null;
      if (e.keyCode === 13 && entered === false) { entered = true; div[i].getElementsByTagName("img")[0].click(); }
    } else div[i].style.display = "none";
  }
  entered = false;
}

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
document.addEventListener("mouseup", function(e) { if (e.button === 0) osContextMenu.style = "display:none;" })

function windowEnable(elmnt, package) {
  var maximizer, maximized, width, height, top, left;
  var minimizer = document.getElementById(elmnt.id + "Minimize");
  if (elmnt.resizable) {
    maximizer = document.getElementById(elmnt.id + "Maximize");
    maximized = false;
    elmnt.maximize = maximize;
  }
  elmnt.minimize = minimize;
  elmnt.minimized = false;
  elmnt.close = function() {
    elmnt.style.transition = null;
    elmnt.style.transform = "scale(0.75)";
    elmnt.style.opacity = 0;
    if (package) if (package.windows[0].id == elmnt.id) os.stopPackage(package);
    setTimeout(function() { document.body.removeChild(elmnt); }, 200)
  };
  document.getElementById(elmnt.id + "Close").onclick = elmnt.close;
  function minimize() {
    if (elmnt.minimized == false) {
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
      width = elmnt.style.width ? elmnt.style.width : "300px";
      height = elmnt.style.height ? elmnt.style.height : "300px";
      top = elmnt.style.top;
      left = elmnt.style.left;
      elmnt.style.width = width;
      elmnt.style.height = height;
      elmnt.style.transition = "0.2s";
      $(elmnt).draggable("disable");
      $(elmnt).resizable("disable");
      setTimeout(function() {
        elmnt.style.top = "0";
        elmnt.style.left = "0";
        elmnt.style.width = "100%";
        elmnt.style.height = "calc(100vh - 55px)";
        setTimeout(function() { elmnt.style.transition = "none"; }, 200);
      }, 1)
    } else {
      elmnt.style.transition = "0.2s";
      $(elmnt).draggable("enable");
      $(elmnt).resizable("enable");
      setTimeout(function() {
        maximized = false;
        elmnt.style.width = width;
        elmnt.style.height = height;
        elmnt.style.top = top;
        elmnt.style.left = left;
        setTimeout(function() { elmnt.style.transition = "none"; }, 200);
      }, 1)
    }
  }
  if (maximizer) { maximizer.addEventListener("click", maximize); document.getElementById(elmnt.id + "TitleBar").addEventListener("dblclick", maximize); }
  if (minimizer) minimizer.addEventListener("click", minimize);
  $(elmnt).draggable({ handle: document.getElementById(elmnt.id + "TitleBar") });
  if (elmnt.resizable) $(elmnt).resizable({ handles: "all" });
  document.getElementById(elmnt.id + "TitleBar").addEventListener("mousedown", function() {
    Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); });
    elmnt.style.zIndex = 2;
  });
}

document.getElementById("StopAllProcesses").onclick = function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.close()); }); }
document.getElementById("MinimizeAllWindows").onclick = function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.minimize()); }); }

//BEGIN SETTINGS HOOK
if (window.localStorage.getItem("theme")) os.filesystem.readFile(window.localStorage.getItem("theme")).then(theme => document.getElementById("STYLE_Theme").href = `data:text/css;base64,${theme}`); else os.filesystem.readFile("/themes/Light.css").then(theme => document.getElementById("STYLE_Theme").href = `data:text/css;base64,${theme}`);

if (window.localStorage.getItem("bgURL")) {
  var bgURLStyle = document.createElement("style");
  bgURLStyle.id = "STYLE_Wallpaper";
  document.head.appendChild(bgURLStyle);
  bgURLStyle.sheet.insertRule("body{background-image:url('" + window.localStorage.getItem("bgURL") + "')}")
};
//END SETTINGS HOOK

window.onload = async function() {
  var packages = await fetch("/packages");
  os.packages = await packages.json();
  os.packages.forEach(async function(package, index) {
    if (package.startOnBoot) os.startPackage(package);
    if (package.isApp) {
      document.getElementById("appsDisplay").innerHTML += `<div><img id="${package.name}Start" src="data:image/webp;base64,${package.icon}"><br>${package.name}</div>`;
      await document.getElementById(`${package.name}Start`);
      document.getElementById(`${package.name}Start`).onclick = function() { os.startPackage(package); };
    };
  })
  setTimeout(function() {
    document.getElementById("startup").style = "transition:0.3s;opacity:0;width:100%;height:100%;position:fixed;";
    setTimeout(function() { document.body.removeChild(document.getElementById("startup")); }, 300)
  }, 1)
}