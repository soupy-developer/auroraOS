;(async function() {
const package = document.currentScript.package;
const packageWindow = package.createWindow(atob(await package.resource("main.html")), { titleBar: "Default", title: "Terminal", minimizable: true, resizable: true, startingDimensions: [600, 400] });

const commandHistory = [""];
var commandHistoryPosition = 0;

const commands = [
  {
    name: "help",
    description: "Shows all available commands.",
    activate: function() {
      writeTerminal("<br><span style='font-weight:bold'>auroraOS Help</span>");
      commands.forEach(command => {
        writeTerminal(`<span style="color:yellow">${command.name}</span> ${command.usage ? `<span style='color:lightblue'>${command.usage.replaceAll("<", "").replaceAll(">", "")}</span>` : ""} - ${command.description ? command.description : "No description available."}`);
      });
      return writeTerminal("<br>");
    }
  },
  {
    name: "echo",
    usage: "message",
    description: "Displays message in the terminal.",
    activate: function(args) { return writeTerminal(args.join(" ")); }
  },
  {
    name: "clear",
    description: "Clears terminal.",
    activate: function() { Array.from(packageWindow.body.childNodes).filter(e => e.tagName === "P").forEach(e => e.remove()); return; }
  },
  {
    name: "eval",
    usage: "code",
    description: "Evaluates JavaScript code. <span style='color:red'>Please be careful with this.<span>",
    activate: function(args) {
      try {
        const output = eval(args.join(" "));
        if (output) return writeTerminal("> " + output);
      } catch(error) {
        return writeTerminal(`<span style='color:red'>${error}</span>`);
      }
    }
  },
  {
    name: "auget",
    usage: "help",
    description: "AuroraGet Package Manager. View help.",
    activate: async function(args) {
      if (args[0] === "view") {
        
        if (!args[1]) return writeTerminal("<span style='color:red'>No package specified.</span>");
        const raw = await fetch(`https://aurora-market.glitch.me/apps/${args[1]}`); if (!raw.ok) return writeTerminal("<span style='color:red'>An internal error occured.</span> The package name may be invalid.");
        const info = await raw.json();
        
        writeTerminal(`<br><span style="font-weight:bold;color:lightgreen">${info.name}</span>@<span style="font-weight:bold;color:lightgreen">${info.version}</span> | published by <span style="color:teal">${info.author}</span><br><br>`)
        if (info.category) writeTerminal(`<span style='color:lightblue'>${info.category}</span>`);
        if (info.site) writeTerminal(`<span style='color:yellow'>${info.site}</span>`);
        writeTerminal("<br>");
        return writeTerminal(info.description + "<br><br>");
        
      } else if (args[0] === "install") {
        
        if (!args[1]) return writeTerminal("<span style='color:red'>No package specified.</span>");
        const raw = await fetch(`https://aurora-market.glitch.me/apps/${args[1]}`); if (!raw.ok) return writeTerminal("<span style='color:red'>An internal error occured.</span> The package name may be invalid.");
        const info = await raw.json();
        
        const result = await requestInput(`<span style='color:teal'>Are you sure you want to install <span style='font-weight:bold;color:lightgreen'>${info.name}</span>?</span> Y/N: `);
        if (result.toLowerCase() !== "y") return writeTerminal("<span style='color:red'>Installation canceled.</span>");
        writeTerminal("Downloading...<br><br>");
        
        const rawFiles = await fetch("https://aurora-market.glitch.me/install/" + args[1]);
        const files = await rawFiles.json();
        if (info.category && info.category === "Theme") {
          writeTerminal(`Writing <span style="color:orange">${info.name}.css</span> to <span style="color:orange">themes/${info.name}.css</span>`);
          const permResult = await os.filesystem.writeFile(`themes/${info.name}.css`, atob(files[0][1]));
          if (permResult === false) return writeTerminal("<span style='color:red'>You do not have permission to install this package.</span> Please contact your system administrator.");
          return writeTerminal("<span style='color:green'>Theme added.</span>");
        } else {
          const permResult = await os.filesystem.writeDirectory("packages/" + info.name);
          if (permResult === false) return writeTerminal("<span style='color:red'>You do not have permission to install this package.</span> Please contact your system administrator.");
          for (const file of files) {
            writeTerminal(`Writing <span style="color:orange">${file[0]}</span> to <span style="color:orange">packages/${info.name}/${file[0]}</span>`);
            await os.filesystem.writeFile(`packages/${info.name}/${file[0]}`, atob(file[1]));
          }
          return writeTerminal("<span style='color:green'>Installation complete.</span> Please restart auroraOS.<br><br>");
        }
        
      } else if (args[0] === "remove") {
        if (!args[1]) return writeTerminal("<span style='color:red'>No package specified.</span>");
        
        const package = await os.filesystem.readDirectory("packages/" + args[1]);
        if (package === false) return writeTerminal("<span style='color:red'>Package was not found.</span> You may need to remove it manually.");
        
        const result = await requestInput(`<span style='color:teal'>Are you really sure you want to remove <span style='font-weight:bold;color:lightgreen'>${args[1]}</span>?</span> Y/N: `);
        if (result.toLowerCase() !== "y") return writeTerminal("<span style='color:red'>Removal canceled.</span>");
        
        writeTerminal("Removing " + args[1] + "...");
        
        const remove = await os.filesystem.deleteDirectory("packages/" + args[1]);
        if (remove === false) return writeTerminal("<span style='color:red'>You do not have permission to remove this package.</span> Please contact your system administrator.");
        
        return writeTerminal("<span style='color:green'>Removal complete.</span> Please restart auroraOS.<br><br>");
        
      } else if (args[0] === "help") {
        
        writeTerminal("<br><span style='font-weight:bold'>AuroraGet Help</span>");
        writeTerminal("auget <span style='color:lightblue'>view</span> <span style='color:yellow'>package name</span> - Returns information about the provided package.");
        writeTerminal("auget <span style='color:lightblue'>install</span> <span style='color:yellow'>package name</span> - Begins the installation process for the provided package. Can also update packages selectively.");
        writeTerminal("auget <span style='color:lightblue'>remove</span> <span style='color:yellow'>package name</span> - Uninstalls the provided package. THIS CANNOT BE REVERSED.");
        writeTerminal("auget <span style='color:lightblue'>update</span> - Returns a list with all packages that must be updated.");
        writeTerminal("auget <span style='color:lightblue'>upgrade</span> - Automatically updates all packages to the newest version.");
        writeTerminal("auget <span style='color:lightblue'>help</span> - Shows this help menu.");
        return writeTerminal("<br>Repository is available at https://bit.ly/3hXXd7z<br><br>");
        
      } else return writeTerminal("<span style='color:red'>Not a valid action.</span> Run <span style='color:yellow'>auget help</span> for more info.");
    }
  }
];

const input = document.querySelector(`#${package.name}ip > input`);

input.onkeydown = async function(e) {
  if (e.keyCode === 13) {
    if (input.value === "") return;
    
    commandHistory.push(input.value);
    commandHistoryPosition = commandHistory.length;
    
    const clone = document.getElementById(`${package.name}ip`).cloneNode(true);
    document.body.appendChild(clone);
    clone.id = "temp";
    const inputText = document.querySelector("#temp > input").value;
    document.querySelector("#temp > input").remove();
    writeTerminal(clone.innerHTML + inputText, false);
    clone.remove();
    
    const args = input.value.split(" ");
    const match = args.shift();
    
    for (const command of commands) {
      if (command.name === match) {
        await command.activate(args);
        document.getElementById(`${package.name}ip`).style.display = "flex";
        packageWindow.body.appendChild(document.getElementById(`${package.name}ip`));
        input.value = null;
        input.focus();
        return;
      }
    }
    writeTerminal("<span style='color:red'>Command not found.</span>");
    document.getElementById(`${package.name}ip`).style.display = "flex";
    packageWindow.body.appendChild(document.getElementById(`${package.name}ip`));
    input.value = null;
    input.focus();
  } else if (e.keyCode === 38) {
    commandHistoryPosition = Math.min(Math.max(commandHistoryPosition - 1, 0), commandHistory.length - 1);
    input.value = commandHistory[commandHistoryPosition];
  } else if (e.keyCode === 40) {
    commandHistoryPosition = Math.min(Math.max(commandHistoryPosition + 1, 0), commandHistory.length - 1);
    input.value = commandHistory[commandHistoryPosition];
  }
};

document.querySelector(`#${package.name}ip > span`).innerText = sessionStorage.getItem("username") + "@auroraos";

const writeTerminal = function(content) {
  const message = document.createElement("p");
  message.style = "margin:0;font-family:monospace";
  message.innerHTML = content;
  packageWindow.body.appendChild(message);
  document.getElementById(`${package.name}ip`).style.display = "none";
};

const requestInput = function(prompt, callback) {
  return new Promise(function(resolve) {
    const ip = document.createElement("span");
    ip.style = "display:flex;white-space:pre-wrap";
    ip.innerHTML = prompt;
    const cinput = document.createElement("input");
    cinput.spellcheck = false;
    cinput.style = "font-family:monospace;flex-grow:50;background:transparent;border:none;box-shadow:none;color:white;font-weight:initial;padding:0;border-radius:0;";

    ip.appendChild(cinput);
    packageWindow.body.appendChild(ip);
    cinput.focus();
    cinput.onkeydown = function(e) {
      if (e.keyCode === 13) {
        const inputText = cinput.value;
        cinput.remove();
        writeTerminal(ip.innerHTML + inputText);
        resolve(inputText);
        ip.remove();
      }
    }
  });
}

const motds = [
  "The chicken came before the egg.",
  "auroraOS is completely open-source!",
  "auroraOS is never gonna give you up.",
  "Check out these transparency effects!",
  "Fun fact: JavaScript was originally called Mocha.",
  "Windows? More like Windon't."
];

writeTerminal("<span style='color:lightblue'>Welcome to the auroraOS terminal.</span>");
writeTerminal(motds[Math.floor(Math.random() * Math.floor(motds.length))]);
writeTerminal("Type <span style='color:yellow'>help</span> for a list of available commands.<br><br>");
document.getElementById(`${package.name}ip`).style.display = "flex";
packageWindow.body.appendChild(document.getElementById(`${package.name}ip`));
input.value = null;
input.focus();
})()