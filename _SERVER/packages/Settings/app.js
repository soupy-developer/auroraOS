;(async function(){
const package = document.currentScript.package;
const packageWindow = await package.createWindow(atob(await package.resource("main.html")), { titleBar: "Default", title: "Settings", minimizable: true, resizable: true, startingDimensions: [300, 300] });

const bgURL = document.getElementById(`${package.name}WallpaperURL`);
const theme = document.getElementById(`${package.name}Theme`);

if (!document.getElementById("STYLE_Wallpaper")) {
  const style = document.createElement("style");
  style.id = "STYLE_Wallpaper";
  document.head.appendChild(style);
  style.sheet.insertRule("a{}");
}

const themes = await os.filesystem.readDirectory("/themes");
themes.forEach(item => {
  const obj = document.createElement("option");
  obj.value = item.path;
  obj.innerHTML = item.name.split('.')[0];
  theme.appendChild(obj);
});

theme.addEventListener("input", async function() {
  window.localStorage.setItem("theme", theme.value);
  document.getElementById("STYLE_Theme").href = `data:text/css;base64,${await os.filesystem.readFile(theme.value)}`;
});

document.getElementById(`${package.name}WallpaperURLSelect`).onclick = function() {
  document.getElementById("STYLE_Wallpaper").sheet.deleteRule(0);
  document.getElementById("STYLE_Wallpaper").sheet.insertRule("body{background-image:url('" + bgURL.value + "')}")
  window.localStorage.setItem("bgURL", bgURL.value);
};

if (window.localStorage.getItem("theme")) theme.value = window.localStorage.getItem("theme"); else theme.value = "/themes/Dark.css";
if (window.localStorage.getItem("bgURL")) bgURL.value = window.localStorage.getItem("bgURL");

document.getElementById(`${package.name}Reset`).onclick = function() {
  os.prompt("This will require a refresh. Save your work and click OK.", "Reset Settings", "", function() {
    window.localStorage.removeItem("theme");
    window.localStorage.removeItem("bgURL");
    window.sessionStorage.removeItem("username");
    window.sessionStorage.removeItem("password");
    window.location = window.location;
  }, false);
};

document.getElementById(`${package.name}About`).onclick = function() { package.createWindow(`<div id="%window%Body" class="windowBody blur" style="text-align:center;"><a href="https://github.com/soupy-developer/auroraOS"><img src="logo.webp" style="float:left;margin-right:15px;"></a><h1 style="float:right;margin-top:20px;margin-left:45px;margin-right:45px;">auroraOS</h1> <p><strong>Build</strong> 101</p> <p><strong>Version</strong> 5.0</p> <p>Made with love by <a href="https://discord.gg/ZYKSYbm">soup</a></p> <h2>Open-source licenses</h2><a href="https://jquery.com/">jQuery & jQueryUI - The jQuery Foundation</a> <br><a href="https://github.com/daneden/animate.css">Animate.css - daneden</a></div>`, { titleBar: "Default", title: "About auroraOS", startingDimensions: [410, 300] }); };
  
})()