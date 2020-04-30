;(async function(){
var package = os.runningPackages[document.currentScript.id];
var wRaw = await package.resource("main.html");
var window = await package.createWindow(atob(wRaw), { resizable: true, startingDimensions: [500, 300] });
var loading = document.getElementById(`${package.name}loading`);
  
var selectCSS = "3px solid rgb(66,144,245)";

async function viewHomepage() {
  loading.style.display = null;
  
  var raw = await fetch("https://aurora-market.glitch.me/homepage");
  var homepage = await raw.json();
  
  document.getElementById(`${package.name}popular`).innerHTML = null;
  
  await homepage.forEach(async function(app) {
    document.getElementById(`${package.name}popular`).innerHTML += `<button id="${app.name}view" style="overflow:hidden;padding:10px;width:250px;height:95px;"> <img src="data:image/webp;base64,${app.icon}" style="height:75px;width:75px;float:left;"> <strong>${app.name}</strong><br><br><text style="opacity:0.6;">${app.shortDescription}</text> </button>`;
    await document.getElementById(`${app.name}view`);
    document.getElementById(`${app.name}view`).onclick = function() { view(app); };
  });
  
  document.getElementById(`${package.name}featured`).src = `data:image/webp;base64,${homepage[0].banner}`;
  document.getElementById(`${package.name}featuredname`).innerText = homepage[0].name;
  
  document.getElementById(`${package.name}homepage`).style.display = null;
  document.getElementById(`${package.name}info`).style.display = "none";
  document.getElementById(`${package.name}list`).style.display = "none";
  
  document.getElementById(`${package.name}ViewAll`).style.borderBottom = selectCSS;
  document.getElementById(`${package.name}ViewInstalled`).style.borderBottom = null;
  
  loading.style.display = "none";
}
  
viewHomepage();
  
document.getElementById(`${package.name}ViewAll`).onclick = viewHomepage;
  
async function view(app) {
  loading.style.display = null;
  var raw = await fetch(`https://aurora-market.glitch.me/apps/${app.name}`);
  var info = await raw.json();
  document.getElementById(`${package.name}infobanner`).src = `data:image/webp;base64,${app.banner}`;
  document.getElementById(`${package.name}infoicon`).src = `data:image/webp;base64,${app.icon}`;
  document.getElementById(`${package.name}infoname`).innerText = app.name;
  document.getElementById(`${package.name}infodescription`).innerText = app.description;
  document.getElementById(`${package.name}homepage`).style.display = "none";
  document.getElementById(`${package.name}list`).style.display = "none";
  document.getElementById(`${package.name}info`).style.display = null;
  document.getElementById(`${package.name}ViewAll`).style.borderBottom = null;
  document.getElementById(`${package.name}ViewInstalled`).style.borderBottom = null;
  document.getElementById(`${package.name}infoinstall`).onclick = async function() {
    var raw = await fetch("https://aurora-market.glitch.me/install/" + app.name);
    var data = await raw.json();
    data.forEach(file => {
      
    })
  }
  loading.style.display = "none";
}
  
})()