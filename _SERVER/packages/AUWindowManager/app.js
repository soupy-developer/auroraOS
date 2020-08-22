var package, menubarSystem, apps, clockDays, clockMonths, defaultTheme
package = document.currentScript.package;
menubarSystem = document.getElementById("systemButton");
apps = document.getElementById("applications");
clockDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
clockMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
defaultTheme = "themes/Windstorm Light.css";

os.filesystem.readFile("themes/Glass.css").then(theme => document.getElementById("STYLE_Theme").href = `data:text/css;base64,${theme}`);

os.registerWindow = function(elmnt, options, package) {
  var width, height, top, left, posX, posY;
  elmnt.maximized = false;
  elmnt.minimized = false;
  elmnt.close = function() {
    elmnt.style.transform = "scale(0.75)";
    elmnt.style.opacity = 0;
    if (package && package.windows[0].id === elmnt.id) os.stopPackage(package);
    setTimeout(function() { elmnt.remove(); }, 200);
  };
  document.getElementById(elmnt.id + "Close").onclick = elmnt.close;
  document.getElementById(elmnt.id + "TitleBar").addEventListener("mousedown", function(e) {
    curZ++; elmnt.style.zIndex = curZ;
    if (elmnt.maximized === false) {
      posX = e.clientX;
      posY = e.clientY;
      function move(e) {
        elmnt.style.left = elmnt.offsetLeft - (posX - e.clientX) + "px";
        elmnt.style.top = elmnt.offsetTop - (posY - e.clientY) + "px";
        posX = e.clientX;
        posY = e.clientY;
      }
      document.onmouseup = function() { document.onmouseup = null; document.removeEventListener("mousemove", move); };
      document.addEventListener("mousemove", move);
    }
  });
  document.getElementById(elmnt.id + "TitleBar").addEventListener("touchstart", function(e) {
    curZ++; elmnt.style.zIndex = curZ;
    if (elmnt.maximized === false) {
      e = e.touches[0];
      posX = e.screenX;
      posY = e.screenY;
      function move(e) {
        e.preventDefault();
        e = e.touches[0];
        elmnt.style.left = elmnt.offsetLeft - (posX - e.clientX) / 0.9 + "px";
        elmnt.style.top = elmnt.offsetTop - (posY - e.clientY) / 0.9 + "px";
        posX = e.clientX;
        posY = e.clientY;
      }
      document.ontouchend = function() { document.ontouchend = null; document.removeEventListener("touchmove", move); };
      document.addEventListener("touchmove", move, { passive: false });
    }
  }, { passive: true });
  if (options.minimizable) {
    elmnt.minimize = function() {
      if (elmnt.minimized == false) {
        elmnt.minimized = true;
        elmnt.style.transform = "scale(0.75)";
        elmnt.style.opacity = 0;
        setTimeout(function() { elmnt.style.display = "none"; }, 200);
      } else {
        elmnt.minimized = false;
        elmnt.style.display = null;
        window.requestAnimationFrame(function() {
          elmnt.style.opacity = null;
          elmnt.style.transform = null;
        });
        curZ++; elmnt.style.zIndex = curZ;
      }
    };
    document.getElementById(elmnt.id + "Minimize").addEventListener("click", elmnt.minimize);
  }
  if (options.resizable) {
    elmnt.maximize = function() {
      if (elmnt.maximized === false) {
        elmnt.maximized = true;
        width = elmnt.style.width;
        height = elmnt.style.height;
        top = elmnt.style.top;
        left = elmnt.style.left;
        elmnt.style.transition = "width 0.2s, height 0.2s, top 0.2s, left 0.2s";
        $(elmnt).resizable("disable");
        window.requestAnimationFrame(function() {
          elmnt.style.top = "0";
          elmnt.style.left = "0";
          elmnt.style.width = "100%";
          elmnt.style.height = "calc(100vh - 52px)";
        });
        setTimeout(function() { elmnt.style.transition = null; }, 200);
      } else {
        elmnt.maximized = false;
        $(elmnt).resizable("enable");
        elmnt.style.transition = "width 0.2s, height 0.2s, top 0.2s, left 0.2s";
        window.requestAnimationFrame(function() {
          elmnt.style.width = width;
          elmnt.style.height = height;
          elmnt.style.top = top;
          elmnt.style.left = left;
        });
        setTimeout(function() { elmnt.style.transition = null; }, 200);
      };
    }
    document.getElementById(elmnt.id + "Maximize").addEventListener("click", elmnt.maximize);
    document.getElementById(elmnt.id + "TitleBar").addEventListener("dblclick", elmnt.maximize);
    $(elmnt).resizable({ handles: "all" });
  }
};

os.alert = async function(message, title="Alert", callback) {
  const alert = await package.createWindow(`<div class="windowBody" style="padding-right:50px;"><h1>${title}</h1><p>${message}</p><button id="%window%ok">OK</button>`, { title: title, titleBar: "Default" })
  document.getElementById(alert.id + "Close").onclick = function() { if(callback) callback(); alert.close(); };
  document.getElementById(alert.id + "ok").onclick = function() { if(callback) callback(); alert.close(); };
  return alert;
}
os.prompt = async function(message, title="Prompt", placeholderText=title, callback, showTextBox=true) {
  const prompt = await package.createWindow(`<div class="windowBody" style="padding-right:50px;"><h1>${title}</h1><p>${message}</p><input id="%window%input" placeholder="${placeholderText}"></input> <button id="%window%ok">OK</button> <button id="%window%cancel">Cancel</button>`, { title: title, titleBar: "Default" })
  if (showTextBox === false) document.getElementById(prompt.id + "input").style.display = "none";
  document.getElementById(prompt.id + "cancel").onclick = prompt.close;
  document.getElementById(prompt.id + "ok").onclick = function() { if(callback) callback(document.getElementById(prompt.id + "input").value); prompt.close(); };
  return prompt;
}

document.getElementById("loginEnter").onclick = async function() {
  const user = document.getElementById("loginUsername").value;
  if (user === "" || document.getElementById("loginPassword").value === "") return document.getElementById("loginInfo").innerText = "Fields cannot be empty";
  document.getElementById("loginEnter").disabled = true;
  const response = await os.fetch("POST", serverAddress + "auth", { username: user, password: document.getElementById("loginPassword").value });
  if (response === "Denied") {
    document.getElementById("loginEnter").disabled = false;
    return document.getElementById("loginInfo").innerText = "Username or password is incorrect";
  }
  document.getElementById("loginInfo").innerText = "Welcome back, " + user + ".";
  ready();
  sessionStorage.setItem("username", user);
  sessionStorage.setItem("password", document.getElementById("loginPassword").value);
  document.getElementById("dock").style.display = null;
  document.getElementById("login").style.opacity = 0;
  setTimeout(function() { document.getElementById("login").remove(); }, 300);
};

;(async function(){
  if (sessionStorage.getItem("username")) {
    const response = await os.fetch("POST", serverAddress + "auth", { username: sessionStorage.getItem("username"), password: sessionStorage.getItem("password") });
    if (response !== "Denied") {
      document.getElementById("login").remove();
      document.getElementById("dock").style.display = null;
      ready();
    }
  }
  
  document.getElementById("startup").style = "transition:0.3s;opacity:0;width:100%;height:100%;position:fixed;z-index:512;";
  setTimeout(function() { document.getElementById("startup").remove(); }, 300);
})()

function ready() {
  if (localStorage.getItem("theme")) os.filesystem.readFile(localStorage.getItem("theme")).then(async function(theme) {
    if (theme === false) { localStorage.setItem("theme", defaultTheme); theme = await os.filesystem.readFile(defaultTheme);  }
    document.getElementById("STYLE_Theme").href = `data:text/css;base64,${theme}`;
  }); else { localStorage.setItem("theme", defaultTheme); os.filesystem.readFile(defaultTheme).then(theme => document.getElementById("STYLE_Theme").href = `data:text/css;base64,${theme}`); };
  
  if (localStorage.getItem("bgURL")) {
    const style = document.createElement("style");
    style.id = "STYLE_Wallpaper";
    document.head.appendChild(style);
    style.sheet.insertRule("body{background-image:url('" + localStorage.getItem("bgURL") + "')}")
  };
  
  function c() {
    const date = new Date();
    var minute = date.getMinutes()
    if (minute < 10) minute = "0" + minute;
    document.getElementById("menubarClock").innerHTML = clockDays[date.getDay()] + " " + clockMonths[date.getMonth()] + " " + date.getDate() + "<br>" + date.getHours() + ":" + minute;
    setTimeout(c, 2500);
  } c();

  menubarSystem.addEventListener("click", function() {
    if (apps.style.display !== "none") {
      document.getElementById("appsDisplay").style.transform = "translateY(40px)";
      apps.style.transform = null;
      apps.style.opacity = 0;
      setTimeout(function() { apps.style.display = "none"; }, 200);
    } else {
      apps.style.display = null;
      document.getElementById("appSearch").value = null;
      if (typeof window.orientation == "undefined") document.getElementById("appSearch").focus();
      window.requestAnimationFrame(function() {
        document.getElementById("appsDisplay").style.transform = null;
        apps.style.transform = "translateY(-52px)";
        apps.style.opacity = 1;
      });
    }
  });

  document.getElementById("appSearch").onkeyup = function(e) {
    const div = document.getElementById("appsDisplay").getElementsByTagName("div");
    for (var i = 0; i < div.length; i++) {
      if (div[i].innerText.toLowerCase().includes(document.getElementById("appSearch").value.toLowerCase())) {
        div[i].style.display = null;
        if (e.keyCode === 13) { div[i].getElementsByTagName("img")[0].click(); break; }
      } else div[i].style.display = "none";
    }
  }

  package.createContextMenu(document, [
    {
      name: "Close all windows",
      activate: function() { os.runningPackages.filter(p => p.windows[0]).forEach(p => p.windows.forEach(w => w.close())); }
    },
    {
      name: "Minimize all windows",
      activate: function() { os.runningPackages.filter(p => p.windows[0]).forEach(p => p.windows.forEach(w => w.minimize())); }
    },
    { type: "separator" },
    {
      name: "Settings",
      activate: function() { os.startPackage(os.packages.find(e => e.name === "Settings")) }
    },
  ]);

  os.packages.filter(package => package.isApp).forEach(package => {
    const element = document.createElement("div");
    element.id = package.name + "Start";
    element.innerHTML = `<img src="data:image/webp;base64,${package.icon}"><br>${package.name}`;
    element.onclick = function() { os.startPackage(package); };
    document.getElementById("appsDisplay").appendChild(element);
  });
  
  os.packages.filter(p => p.startOnLogin).forEach(os.startPackage);
}