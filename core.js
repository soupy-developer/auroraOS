"use strict";

const serverAddress = "/" // Change to your server address

var curID, openContextMenu; curID = 0; openContextMenu = null;

var curZ = 0;
var mouseX = 0;
var mouseY = 0;

String.prototype.replaceAll = function(f,r){return this.split(f).join(r);};

document.addEventListener("mousemove", function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const os = {
  runningPackages: [],
  startPackage: async function(app, flags) {
    document.body.style.cursor = "progress";
    const packagee = Object.assign({}, app);
    packagee.name += curID.toString(); curID++;
    packagee.absoluteName = app.name;
    packagee.flags = flags;
    packagee.windows = [];
    packagee.resource = async function(filePath) { return await os.filesystem.readFile(`/packages/${packagee.directoryName}/${filePath}`); };
    if (packagee.isApp) {
      const startAnim = document.createElement("img");
      packagee.dockIcon = document.createElement("img");
      startAnim.src = packagee.dockIcon.src = `data:image/webp;base64,${app.icon}`;
      startAnim.style = `position:fixed;z-index:500;transition:opacity 0.3s, transform 0.3s;pointer-events:none;transform:translate(-50%, -50%) scale(0.4);top:${mouseY}px;left:${mouseX}px;height:300px;width:300px;`;
      packagee.dockIcon.style = "transform:scale(0);margin-left:-18px;margin-right:-18px;";
      packagee.dockIcon.onclick = function() { packagee.windows.forEach(w => { if (w.minimized === packagee.windows[0].minimized) w.minimize(); }) };
      document.getElementById("dockDisplay").appendChild(packagee.dockIcon);
      document.body.appendChild(startAnim);
      setTimeout(function() { startAnim.remove(); }, 300);
      window.requestAnimationFrame(function() {
        packagee.dockIcon.style = null;
        startAnim.style.opacity = 0;
        startAnim.style.transform = "translate(-50%, -50%)";
      });
    };
    const script = document.createElement("script");
    script.src = "data:text/javascript;base64," + await packagee.resource("app.js");
    script.defer = true;
    script.package = packagee;
    document.body.appendChild(script);
    os.runningPackages.push(packagee);
    packagee.createWindow = function(body, options={}) {
      const pwindow = document.createElement("div");
      pwindow.id = packagee.name + "Window" + curID.toString(); curID++;
      pwindow.className = "window";
      if (options.titleBar === "Default") {
        var buttons = '<div id="%window%Close" class="windowAction"><img src="close.svg"></div>';
        if (options.resizable) buttons += '<div id="%window%Maximize" class="windowAction"><img src="max.svg"></div>';
        if (options.minimizable) buttons += '<div id="%window%Minimize" class="windowAction"><img src="min.svg"></div>';
        var string = `<div id="%window%TitleBar" class="windowTitleBar">${buttons}<ui>${options.title}</ui></div>${body}`;
        pwindow.innerHTML = string.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, pwindow.id);
      } else if (options.titleBar === "Custom") {
        pwindow.innerHTML = body.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, pwindow.id);
      }
      pwindow.style = "opacity:0;transform:scale(0.85);";
      if (options.startingPosition) pwindow.style = `opacity:0;transform:scale(0.85);left:${options.startingPosition[0]}px;top:${options.startingPosition[1]}px;`;
      document.body.appendChild(pwindow);
      curZ++; window.requestAnimationFrame(function() {
        pwindow.style.zIndex = curZ;
        pwindow.style.opacity = null;
        pwindow.style.transform = null;
      });
      os.registerWindow(pwindow, options, packagee);
      pwindow.body = document.getElementById(`${pwindow.id}Body`);
      pwindow.edit = function(body) { pwindow.body.outerHTML = body.replaceAll(/%package%/, packagee.name).replaceAll(/%window%/, pwindow.id); };
      packagee.windows.push(pwindow);
      pwindow.style.width = options.startingDimensions ? options.startingDimensions[0] + "px" : pwindow.offsetWidth + 2 + "px";
      pwindow.style.height = options.startingDimensions ? options.startingDimensions[1] + "px" : pwindow.offsetHeight + 2 + "px";
      if (!options.startingPosition) {
        pwindow.style.top = (screen.height / 2) - (pwindow.offsetHeight / 2) - 52 + "px";
        pwindow.style.left = (screen.width / 2) - (pwindow.offsetWidth / 2) + "px";
      }
      if (document.getElementById("applications").style.display !== "none") document.getElementById("systemButton").click();
      return pwindow;
    };
    packagee.createContextMenu = function(bind, items, checkFunc) {
      const menu = document.createElement("div");
      const object = {
        remove: function() { menu.remove(); document.body.removeEventListener("mouseup", object.hide); },
        hide: function(e) { if ((e && e.button === 0) || !e) { menu.style.display = "none"; openContextMenu = null; } },
        disableItem: function(item, value) {
          if (value === false) {
            item.removeAttribute("disabled");
            item.onclick = item.disabledclick;
            item.disabledclick = null;
          } else {
            item.setAttribute("disabled", true)
            item.disabledclick = item.onclick;
            item.onclick = null;
          }
        },
      };
      menu.className = "contextMenu";
      menu.style.display = "none";
      items.forEach(item => {
        if (!item.type || item.type === "button") {
          const element = document.createElement("div");
          element.className = "contextMenuSelection";
          element.innerText = item.name;
          if (item.disabled) {
            element.setAttribute("disabled", true)
            element.disabledclick = item.activate;
          } else element.onclick = item.activate;
          menu.appendChild(element);
          object[item.name] = element;
        } else if (item.type === "separator") {
          const element = document.createElement("div");
          element.className = "contextMenuSeparator";
          menu.appendChild(element);
        }
      });
      bind.addEventListener("contextmenu", function(e) {
        if (e.defaultPrevented) return; e.preventDefault();
        if (openContextMenu) openContextMenu.style.display = "none"; openContextMenu = menu;
        if (checkFunc) checkFunc(e);
        menu.style.display = null;
        menu.style.top = e.clientY - 20 + "px";
        menu.style.left = e.clientX + "px";
        window.requestAnimationFrame(function() { menu.style.top = e.clientY + "px"; });
      }, false);
      document.addEventListener("mouseup", object.hide);
      document.body.appendChild(menu);
      return object;
    },
    script.remove();
    document.body.style.cursor = null;
    return packagee;
  },
  stopPackage: function(app) {
    if (app.close) app.close();
    if (app.isApp) {
      app.dockIcon.style = "transform:scale(0);margin-left:-18px;margin-right:-18px;";
      setTimeout(function() { app.dockIcon.remove(); }, 500)
    }
    os.runningPackages.splice(os.runningPackages.findIndex(p => p.name === app.name), 1)
  },
  fetch: function(method, path, data) {
    return new Promise(function(resolve, err) {
      const xhr = new XMLHttpRequest();
      xhr.open(method, path);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else err({ status: xhr.status, statusText: xhr.statusText });
      };
      xhr.onerror = function() { err({ status: xhr.status, statusText: xhr.statusText }); };
      xhr.send(JSON.stringify(data));
    });
  },
  filesystem: {
    readDirectory: async function(path) {
      path = path.replaceAll("/", "%2F");
      const result = await os.fetch("POST", `${serverAddress}file/read/directory/${path}`, { username: sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "guest", password: sessionStorage.getItem("password") ? sessionStorage.getItem("password") : "guest" });
      if (result === "Denied") return false; else return JSON.parse(result);
    },
    readFile: async function(path) {
      path = path.replaceAll("/", "%2F");
      const result = await os.fetch("POST", `${serverAddress}file/read/file/${path}`, { username: sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "guest", password: sessionStorage.getItem("password") ? sessionStorage.getItem("password") : "guest" });
      if (result === "Denied") return false; else return result;
    },
    writeDirectory: async function(path) {
      path = path.replaceAll("/", "%2F");
      const result = await os.fetch("POST", `${serverAddress}file/write/directory/${path}`, { username: sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "guest", password: sessionStorage.getItem("password") ? sessionStorage.getItem("password") : "guest" });
      if (result === "Denied") return false; else return true;
    },
    writeFile: async function(path, data) {
      path = path.replaceAll("/", "%2F");
      const result = await os.fetch("POST", `${serverAddress}file/write/file/${path}`, { username: sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "guest", password: sessionStorage.getItem("password") ? sessionStorage.getItem("password") : "guest", data: btoa(data) });
      if (result === "Denied") return false; else return true;
    },
    deleteDirectory: async function(path) {
      path = path.replaceAll("/", "%2F");
      const result = await os.fetch("POST", `${serverAddress}file/rm/directory/${path}`, { username: sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "guest", password: sessionStorage.getItem("password") ? sessionStorage.getItem("password") : "guest" });
      if (result === "Denied") return false; else return true;
    },
    deleteFile: async function(path) {
      path = path.replaceAll("/", "%2F");
      const result = await os.fetch("POST", `${serverAddress}file/rm/file/${path}`, { username: sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "guest", password: sessionStorage.getItem("password") ? sessionStorage.getItem("password") : "guest" });
      if (result === "Denied") return false; else return true;
    },
  }
};

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/PWA-service.js");

;(async function() {
  const packages = await fetch(serverAddress + "packages");
  os.packages = await packages.json();
  os.packages.filter(p => p.startOnBoot).forEach(os.startPackage);
})();