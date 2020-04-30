var menubarSystem = document.getElementById("systemButton");
var apps = document.getElementById("applications");
var menubarClick = false;
var clockDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var clockMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var osContextMenu = document.getElementById("osContextMenu");
var loading = document.getElementById("menubarLoading");

var packageStartAnim = document.getElementById("PackageStartAnimation");
var mouseX, mouseY;

String.prototype.replaceAll = function(f,r) { return this.split(f).join(r); } 

addEventListener("mousemove", function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

var os = {
  alert: function(message, title="Alert", pwindow="Alert", callback) {
    var alert = document.getElementById("Alert").cloneNode(true);
    alert.id += Math.random().toString();
    alert.innerHTML = alert.innerHTML.replaceAll("%window%", alert.id);
    alert.style.opacity = 0;
    alert.style.transform = "scale(0.75)";
    alert.style.display = null;
    if (pwindow !== "Alert") {
      var windowObject = document.getElementById(pwindow);
      alert.style.left = mouseX + "px";//windowObject.style.left;
      alert.style.top = mouseY + "px";//windowObject.style.top;
    }
    alert.style.zIndex = 200;
    document.body.appendChild(alert);
    if (callback) document.getElementById(`${alert.id}Close`).onmouseup = function() { callback(); };
    document.getElementById(`${alert.id}TitleBar`).innerHTML = title;
    document.getElementById(`${alert.id}Title`).innerHTML = title;
    document.getElementById(`${alert.id}Message`).innerHTML = message;
    window.requestAnimationFrame(function() { alert.style.opacity = 1; alert.style.transform = "scale(1)"; });
    windowEnable(alert);
  },
  prompt: function(message, title="Prompt", pwindow="Prompt", callback, showTextBox=true) {
    var prompt = document.getElementById("Prompt").cloneNode(true);
    prompt.id += Math.random().toString();
    prompt.innerHTML = prompt.innerHTML.replaceAll("%window%", prompt.id);
    prompt.style.display = null;
    prompt.style.opacity = 0;
    prompt.style.transform = "scale(0.75)";
    if (!(pwindow === "Prompt")) {
      var windowObject = document.getElementById(pwindow);
      prompt.style.left = mouseX + "px";//windowObject.style.left;
      prompt.style.top = mouseY + "px";//windowObject.style.top;
    }
    document.body.appendChild(prompt);
    document.getElementById(`${prompt.id}OK`).onclick = function() { callback(document.getElementById(`${prompt.id}Input`).value); prompt.close(); };
    document.getElementById(`${prompt.id}TitleBar`).innerHTML = title;
    document.getElementById(`${prompt.id}Title`).innerHTML = title;
    if (showTextBox) { document.getElementById(`${prompt.id}Input`).style = null; document.getElementById(`${prompt.id}Input`).placeholder = title; }
    document.getElementById(`${prompt.id}Message`).innerHTML = message;
    windowEnable(prompt);
    window.requestAnimationFrame(function() { prompt.style.opacity = null; prompt.style.transform = null; })
  },
  runningPackages: {},
  startPackage: async function(package, flags) {
    loading.style.display = null;
    var packagee = Object.assign({}, package);
    packagee.name += Math.random().toString();
    packagee.absoluteName = package.name;
    packagee.flags = flags;
    packagee.windows = [];
    if (packagee.isApp) {
      packagee.dockIcon = document.createElement("img");
      packagee.dockIcon.src = `data:image/webp;base64,${package.icon}`;
      packageStartAnim.src = packagee.dockIcon.src;
      packagee.dockIcon.style = "transform:scale(0);";
      document.getElementById("dockDisplay").appendChild(packagee.dockIcon);
      packagee.dockIcon.onclick = function() { packagee.windows.forEach(w => w.minimize()); };
      packageStartAnim.style = `transform:translate(-50%, -50%) scale(0.4);top:${mouseY}px;left:${mouseX}px;`;
      window.requestAnimationFrame(function() {
        packagee.dockIcon.style = null;
        packageStartAnim.style.opacity = 0;
        packageStartAnim.style.transform = "translate(-50%, -50%)";
        setTimeout(function() { packageStartAnim.style.display = "none"; }, 300)
      });
    };
    var packageJS = await os.filesystem.readFile(`/packages/${package.name}/app.js`);
    var script = document.createElement("script");
    script.src = "data:text/javascript;base64," + packageJS;
    script.id = packagee.name;
    script.defer = true;
    document.body.appendChild(script);
    packagee.script = script;
    os.runningPackages[packagee.name] = packagee;
    packagee.createWindow = function(body, options={}) {
      var pwindow = document.createElement("div");
      pwindow.id = packagee.name + "Window" + Math.random().toString();
      pwindow.className += "window";
      pwindow.innerHTML = body.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, pwindow.id);
      pwindow.style = "opacity:0;transform:scale(0.85);";
      document.body.appendChild(pwindow);
      if (menubarClick) menubarSystem.click();
      window.requestAnimationFrame(function() { pwindow.style = null; });
      setTimeout(function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(pwindow => pwindow.style.zIndex = 1); }); pwindow.style.zIndex = 2; }, 200)
      if (options.resizable === true) pwindow.resizable = true;
      windowEnable(pwindow, packagee);
      pwindow.edit = function(body) { document.getElementById(`${pwindow.id}Body`).outerHTML = body.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, pwindow.id); };
      pwindow.body = document.getElementById(`${pwindow.id}Body`);
      packagee.windows.push(pwindow);
      setTimeout(function() { if (options.startingDimensions) pwindow.style += `;width:${options.startingDimensions[0]}px;height:${options.startingDimensions[1]}px;`; }, 50)
      return pwindow;
    };
    packagee.resource = async function(filePath) { return await os.filesystem.readFile(`/packages/${packagee.absoluteName}/${filePath}`); };
    loading.style.display = "none";
  },
  stopPackage: function(package) {
    if (package.isApp) {
      package.dockIcon.style = "transform:scale(0);";
      setTimeout(function() { package.dockIcon.remove(); }, 500)
    }
    if (package.close) package.close();
    document.body.removeChild(package.script);
    delete os.runningPackages[package.name];
  },
  filesystem: {
    readDirectory: async function(path) {
      if (path.includes("./")) path = "/";
      path = path.replaceAll("/", "%2F");
      var raw = await fetch(`/file/read/directory/${path}`);
      var dir = await raw.json();
      return dir;
    },
    readFile: async function(path) {
      loading.style.display = null;
      if (path.includes("./")) return;
      path = path.replaceAll("/", "%2F");
      var raw = await fetch(`/file/read/file/${path}`);
      var file = await raw.json();
      loading.style.display = "none";
      return file;
    },
    writeDirectory: function(path) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "%2F");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `/file/write/directory/${path}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ data: null }));
    },
    writeFile: function(path, data) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "%2F");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `/file/write/file/${path}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ data: btoa(data) }));
    },
    deleteDirectory: function(path) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "%2F");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `/file/rm/directory/${path}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ data: null }));
    },
    deleteFile: function(path) {
      if (path.includes("./")) return;
      path = path.replaceAll("/", "%2F");
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
}, 2500);

menubarSystem.addEventListener("click", function() {
  if (menubarClick) {
    menubarClick = false;
    apps.style.transform = null;
    apps.style.opacity = 0;
    setTimeout(function() {
      apps.style.display = "none";
    }, 200);
  } else {
    menubarClick = true;
    apps.style.display = null;
    document.getElementById("appSearch").value = null;
    document.getElementById("appSearch").focus();
    window.requestAnimationFrame(function() {
      apps.style.transform = "translateY(-55px)";
      apps.style.opacity = 1;
    });
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
  window.requestAnimationFrame(function() {
    osContextMenu.style.top = e.clientY + "px";
  });
}, false);
document.addEventListener("mouseup", function(e) { if (e.button === 0) osContextMenu.style = "display:none;" })

function windowEnable(elmnt, package) {
  var maximizer, maximized, width, height, top, left, pos1, pos2, pos3, pos4;
  var minimizer = document.getElementById(elmnt.id + "Minimize");
  maximized = false;
  if (elmnt.resizable) {
    maximizer = document.getElementById(elmnt.id + "Maximize");
    elmnt.maximize = maximize;
  }
  elmnt.minimize = minimize;
  elmnt.minimized = false;
  elmnt.close = function() {
    elmnt.style.transform = "scale(0.75)";
    elmnt.style.opacity = 0;
    if (package) if (package.windows[0].id == elmnt.id) os.stopPackage(package);
    setTimeout(function() { document.body.removeChild(elmnt); }, 200)
  };
  document.getElementById(elmnt.id + "Close").onclick = elmnt.close;
  function minimize() {
    if (elmnt.minimized == false) {
      elmnt.minimized = true;
      elmnt.style.transform = "scale(0.75)";
      elmnt.style.opacity = 0;
      setTimeout(function() { elmnt.style.display = "none"; }, 200)
    } else {
      elmnt.minimized = false;
      elmnt.style.display = null;
      window.requestAnimationFrame(function() { elmnt.style.opacity = null; elmnt.style.transform = null; });
      Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); });
      elmnt.style.zIndex = 2;
    }
  }
  function maximize() {
    if (maximized == false) {
      maximized = true;
      width = elmnt.style.width ? elmnt.style.width : "350px";
      height = elmnt.style.height ? elmnt.style.height : "300px";
      top = elmnt.style.top;
      left = elmnt.style.left;
      elmnt.style.width = width;
      elmnt.style.height = height;
      elmnt.style.transition = "width 0.2s, height 0.2s, top 0.2s, left 0.2s";
      $(elmnt).resizable("disable");
      window.requestAnimationFrame(function() {
        elmnt.style.top = "0";
        elmnt.style.left = "0";
        elmnt.style.width = "100%";
        elmnt.style.height = "calc(100vh - 55px)";
      });
      setTimeout(function() { elmnt.style.transition = null; }, 200);
    } else {
      maximized = false;
      $(elmnt).resizable("enable");
      elmnt.style.transition = "width 0.2s, height 0.2s, top 0.2s, left 0.2s";
      window.requestAnimationFrame(function() {
        elmnt.style.width = width;
        elmnt.style.height = height;
        elmnt.style.top = top;
        elmnt.style.left = left;
      });
      setTimeout(function() { elmnt.style.transition = null; }, 200);
    }
  }
  if (maximizer) { maximizer.addEventListener("click", maximize); document.getElementById(elmnt.id + "TitleBar").addEventListener("dblclick", maximize); }
  if (minimizer) minimizer.addEventListener("click", minimize);
  
  document.getElementById(elmnt.id + "TitleBar").addEventListener("mousedown", function(e) {
    Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); });
    elmnt.style.zIndex = 2;
    if (maximized == false) {
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = function() {document.onmouseup = null; document.onmousemove = null;};
      document.onmousemove = function(e) {
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }
    }
  });
  document.getElementById(elmnt.id + "TitleBar").addEventListener("touchstart", function(e) {
    Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); });
    elmnt.style.zIndex = 2;
    if (maximized == false) {
      e = e.touches[0];
      pos3 = e.screenX;
      pos4 = e.screenY;
      function move(e) {
        e.preventDefault();
        e = e.touches[0];
        pos1 = pos3 - e.screenX;
        pos2 = pos4 - e.screenY;
        pos3 = e.screenX;
        pos4 = e.screenY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }
      document.ontouchend = function() {document.ontouchend = null; document.removeEventListener("touchmove", move)};
      document.addEventListener("touchmove", move);
    }
  }, {passive: true});
  
  if (elmnt.resizable) $(elmnt).resizable({ handles: "all" });
  document.getElementById(elmnt.id + "TitleBar").addEventListener("mousedown", function() {
    Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.style.zIndex = 1); });
    elmnt.style.zIndex = 2;
  });
}

document.getElementById("StopAllProcesses").onclick = function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.close()); }); }
document.getElementById("MinimizeAllWindows").onclick = function() { Object.values(os.runningPackages).forEach(package => { if (package.windows[0]) package.windows.forEach(window => window.minimize()); }); }

//BEGIN SETTINGS HOOK
if (window.localStorage.getItem("theme")) os.filesystem.readFile(window.localStorage.getItem("theme")).then(theme => document.getElementById("STYLE_Theme").href = `data:text/css;base64,${theme}`); else os.filesystem.readFile("/themes/Dark.css").then(theme => document.getElementById("STYLE_Theme").href = `data:text/css;base64,${theme}`);

if (window.localStorage.getItem("bgURL")) {
  var bgURLStyle = document.createElement("style");
  bgURLStyle.id = "STYLE_Wallpaper";
  document.head.appendChild(bgURLStyle);
  bgURLStyle.sheet.insertRule("body{background-image:url('" + window.localStorage.getItem("bgURL") + "')}")
};
//END SETTINGS HOOK

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/PWA-service.js");

window.onload = async function() {
  var packages = await fetch("/packages");
  os.packages = await packages.json();
  os.packages.forEach(async function(package, index) {
    if (package.startOnBoot) os.startPackage(package);
    if (package.isApp) {
      document.getElementById("appsDisplay").innerHTML += `<div id="${package.name}Start"><img src="data:image/webp;base64,${package.icon}"><br>${package.name}</div>`;
      await document.getElementById(`${package.name}Start`);
      document.getElementById(`${package.name}Start`).onclick = function() { os.startPackage(package); };
    };
  })
  window.requestAnimationFrame(function() {
    document.getElementById("startup").style = "transition:0.3s;opacity:0;width:100%;height:100%;position:fixed;";
    setTimeout(function() { document.getElementById("startup").remove(); }, 300)
  });
  
  /*document.getElementById("applications").remove(); // for snorp's use only - use dis wen is updating to 5.0 and wen snorp has motivation
  document.getElementById("dock").remove();
  document.getElementById("osContextMenu").remove();
  document.getElementById("%window%Close").disabled = true;
  return os.alert("<strong>0x01</strong> - Server is unavailable or is handling too many requests.<br><b>You shouldn't see this, contact Snorp.</b>", "");*/
}