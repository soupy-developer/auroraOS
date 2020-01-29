;(async function(){
var package = os.runningPackages[document.currentScript.id];
var mainWindowRaw = await package.resource("main.html");
var packageWindow = await package.createWindow(atob(mainWindowRaw), { resizable: true });

var bgURL = document.getElementById(`${package.name}WallpaperURL`);
var theme = document.getElementById(`${package.name}Theme`);

if (!document.getElementById("STYLE_Wallpaper")) {
  var bgURLStyle = document.createElement("style");
  bgURLStyle.id = "STYLE_Wallpaper";
  document.head.appendChild(bgURLStyle);
  bgURLStyle.sheet.insertRule("a{}");
}

var themes = await os.filesystem.readDirectory("/themes");
themes.forEach(item => {
  var obj = document.createElement("option");
  obj.value = item.path;
  obj.innerHTML = item.name.split('.')[0];
  theme.appendChild(obj);
});

theme.addEventListener("input", async function() {
  window.localStorage.setItem("theme", theme.value);
  var style = await os.filesystem.readFile(theme.value);
  document.getElementById("STYLE_Theme").href = `data:text/css;base64,${style}`;
});

document.getElementById(`${package.name}WallpaperURLSelect`).onclick = function() {
  document.getElementById("STYLE_Wallpaper").sheet.deleteRule(0);
  document.getElementById("STYLE_Wallpaper").sheet.insertRule("body{background-image:url('" + bgURL.value + "')}")
  window.localStorage.setItem("bgURL", bgURL.value);
};

if (window.localStorage.getItem("theme")) theme.value = window.localStorage.getItem("theme"); else theme.value = "/themes/Light.css";
if (window.localStorage.getItem("bgURL")) bgURL.value = window.localStorage.getItem("bgURL");

document.getElementById(`${package.name}Reset`).onclick = function() {
  os.prompt("This will require a refresh. Save your work and click OK.", "Reset Settings", packageWindow.id, function() {
    window.localStorage.removeItem("theme");
    window.localStorage.removeItem("bgURL");
    window.location = window.location;
  }, false);
};

document.getElementById(`${package.name}About`).onclick = function() { package.createWindow(`<div id="%window%TitleBar" class="windowTitleBar blur"><div id="%window%Close" class="windowAction"><img src="close.svg"></div>About auroraOS</div><div id="%window%Body" class="windowBody blur" style="text-align:center;"><img src="logo.webp" style="float:left;margin-right:15px;"> <h1 style="float:right;margin-top:20px;margin-left:45px;margin-right:45px;">auroraOS</h1> <p><strong>Build</strong> 39</p> <p><strong>Version</strong> 4.0</p> <p>Made with love by <a href="https://discord.gg/8nFuT3d">soup</a></p> <h2>Open-source licenses</h2><a href="https://jquery.com/">jQuery - The jQuery Foundation</a> <br><a href="https://jqueryui.com/">jQueryUI - The jQuery Foundation</a><br><a href="https://ace.c9.io/">Ace - Cloud9, Mozilla</a><br><a href="https://github.com/daneden/animate.css">Animate.css - daneden</a><br><a href="https://github.com/soupy-developer/auroraOS">And of course, auroraOS itself</a></div>`); };
  
})()