;(async function(){
var package = os.runningPackages[document.currentScript.id];
var mainWindowRaw = await package.resource("main.html");
var packageWindow = await package.createWindow(atob(mainWindowRaw));

var fontSize = document.getElementById(`${package.name}FontSize`);
var bgURL = document.getElementById(`${package.name}WallpaperURL`);
var theme = document.getElementById(`${package.name}Theme`);

if (!document.getElementById("STYLE_FontSize")) {
  var fontSizeStyle = document.createElement("style");
  fontSizeStyle.id = "STYLE_FontSize";
  document.head.appendChild(fontSizeStyle);
  fontSizeStyle.sheet.insertRule("a{}");
}
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

fontSize.addEventListener("input", function() {
  document.getElementById("STYLE_FontSize").sheet.deleteRule(0);
  document.getElementById("STYLE_FontSize").sheet.insertRule("*:not(h1){font-size:" + fontSize.value + "px;}");
  document.getElementById(`${package.name}FontSizePreview`).innerHTML = "Font Size: " + fontSize.value + "px";
});

theme.addEventListener("input", async function() {
  document.body.className = "loading";
  var style = await os.filesystem.readFile(theme.value);
  document.getElementById("STYLE_Theme").href = `data:text/css;base64,${style}`;
  document.body.className = null;
  window.localStorage.setItem("theme", theme.value);
});

document.getElementById(`${package.name}WallpaperURLSelect`).onclick = function() {
  document.getElementById("STYLE_Wallpaper").sheet.deleteRule(0);
  document.getElementById("STYLE_Wallpaper").sheet.insertRule("body{background-image:url('" + bgURL.value + "')}")
  window.localStorage.setItem("bgURL", bgURL.value);
};

if (window.localStorage.getItem("theme")) theme.value = window.localStorage.getItem("theme");
if (window.localStorage.getItem("bgURL")) bgURL.value = window.localStorage.getItem("bgURL");

document.getElementById(`${package.name}Reset`).onclick = function() {
  os.prompt("This will require a refresh. Save your work and click OK.", "Reset Settings", packageWindow.id, function() {
    window.localStorage.removeItem("theme");
    window.localStorage.removeItem("bgURL");
    window.location = window.location;
  }, false);
};

})()