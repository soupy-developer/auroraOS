;(async function(){
const package = document.currentScript.package;
const window = await package.createWindow(atob(await package.resource("main.html")), { titleBar: "Default", title: "Market", minimizable: true, resizable: true, startingDimensions: [500, 300] });
const loading = document.getElementById(`${package.name}loading`);
  
const selectCSS = "3px solid rgb(66,144,245)";

async function viewHomepage() {
  loading.style.display = null;
  
  const raw = await fetch("https://aurora-market.glitch.me/homepage");
  const homepage = await raw.json();
  
  document.getElementById(`${package.name}popular`).innerHTML = null;
  
  await homepage.forEach(async function(app) {
    document.getElementById(`${package.name}popular`).innerHTML += `<button id="${app.name}view" style="overflow:hidden;padding:10px;width:250px;height:95px;"> <img src="data:image/webp;base64,${app.icon}" style="height:75px;width:75px;float:left;"> <strong>${app.name}</strong><br><br><text style="opacity:0.6;">${app.shortDescription}</text> </button>`;
    await document.getElementById(`${app.name}view`);
    document.getElementById(`${app.name}view`).onclick = function() { view(app); };
  });
  
  document.getElementById(`${package.name}featured`).src = `data:image/webp;base64,${homepage[0].banner}`;
  document.getElementById(`${package.name}featuredname`).innerText = homepage[0].name;
  
  document.getElementById(`${package.name}homepage`).style.display = "table";
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
  const raw = await fetch(`https://aurora-market.glitch.me/apps/${app.name}`);
  const info = await raw.json();
  document.getElementById(`${package.name}infobanner`).src = `data:image/webp;base64,${app.banner}`;
  document.getElementById(`${package.name}infoicon`).src = `data:image/webp;base64,${app.icon}`;
  document.getElementById(`${package.name}infoname`).innerText = app.name;
  document.getElementById(`${package.name}infodescription`).innerText = app.description;
  document.getElementById(`${package.name}homepage`).style.display = "none";
  document.getElementById(`${package.name}list`).style.display = "none";
  document.getElementById(`${package.name}info`).style.display = "table";
  document.getElementById(`${package.name}ViewAll`).style.borderBottom = null;
  document.getElementById(`${package.name}ViewInstalled`).style.borderBottom = null;
  document.getElementById(`${package.name}infoinstall`).onclick = async function() {
    document.getElementById(`${package.name}infoinstall`).disabled = true;
    const rawApp = await fetch("https://aurora-market.glitch.me/install/" + app.name);
    const appData = await rawApp.json();
    const result = await os.filesystem.writeDirectory("packages/" + app.name);
    if (result === false) return os.alert("Not allowed to install applications.", "Write Error");
    appData.forEach(file => os.filesystem.writeFile(`packages/${app.name}/${file[0]}`, atob(file[1])));
    os.stopPackage(package);
    return os.alert("Installation complete. Restart auroraOS.", "Installation complete");
  }
  loading.style.display = "none";
}
  
})()