;(async function(){
var package = os.runningPackages[document.currentScript.id];
var mainWindowRaw = await package.resource("main.html");
package.createWindow(atob(mainWindowRaw), { resizable: true });
})()