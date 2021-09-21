const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = require("electron");
const fs = require("fs");

let mainWindow;
let selectedFile;
let onFileOffsetFound;

// 'event:form-iso-selected' will be fired from window when user selects ISO file.
// after this event background shoud fire 'event:file-account-found' event with
// account offset and current account (from file) data.
ipcMain.on("event:form-iso-selected", (e, files) => {
    const size = fs.statSync(files).size;
    const bytesInPercent = Math.round((size / 100));
    //console.log(`File:${files} (${size} bytes) (1% - ${bytesInPercent} bytes)`);
    const readInterface = fs.createReadStream(files, {
        highWaterMark: 1048576,
        encoding: "latin1"
    });
    let found = false;
    let lastPercent = 0;
    let bytesChecked = 0;
    readInterface.on("data", (chunk) => {
        bytesChecked += chunk.length;
        const percents = (bytesChecked - (bytesChecked % bytesInPercent)) / bytesInPercent;
        if (lastPercent != percents) {
            mainWindow.webContents.send("event:file-progress-bar", percents);
        }
        lastPercent = percents;
        const search = chunk.search("dwaccount=");
        if (search === -1) {
            return;
        }
        found = true;
        readInterface.destroy();
        //console.log(`search... Found 'dwaccount=' after checking ${bytesChecked} bytes`);
        const onFileAccountFound = chunk.substring(search + 10, search + 32).split("\n");
        onFileOffsetFound = bytesChecked - chunk.length + search + 10;
        //console.log(`dwaccount = ${onFileAccountFound[0]}`);
        //console.log(`Offset = ${onFileOffsetFound} (decimal) ${onFileOffsetFound.toString(16)} (hex)`);
        mainWindow.webContents.send("event:file-account-found", onFileAccountFound[0]);
        mainWindow.webContents.send("event:file-offset-found", onFileOffsetFound.toString(16).toUpperCase());
        selectedFile = files;
    });
    readInterface.on("close", () => {
        if (found !== false) {
            return;
        }
        mainWindow.webContents.send("event:file-account-not-found");
        bytesChecked = 0;
    });
});

// 'event:form-set-account' will be fired from window when user asks to change
// account to new one. After this background should fire 'event:file-account-set'
// event with account offset and current account (from file) data.
ipcMain.on("event:form-set-account", (e, account) => {
    let bufferCharArray = [];
    const accountCharArray = account.split("");
    let nlPos = 0;
    //console.log(`Account split() = ${accountCharArray}`);
    for (let charPos = 0; charPos < 24; charPos++) {
        if (accountCharArray[charPos] !== undefined) {
            bufferCharArray.push(accountCharArray[charPos]);
            continue;
        }
        if (nlPos === 0) {
            nlPos = charPos;
            bufferCharArray.push("\n");
            continue;
        }
        bufferCharArray.push("0");
    }
    //console.log(`Account split() + FILL = ${bufferCharArray}`);
    const bufferAccount = bufferCharArray.join("");
    //console.log(`Account + FILL = ${bufferAccount}`);
    const buf = new Buffer.from(bufferAccount, ["latin1"]);
    const write = fs.openSync(selectedFile,"r+");
    fs.writeSync(write, buf, 0, buf.length, onFileOffsetFound);
    fs.close(write, () => {
        mainWindow.webContents.send("event:file-account-set", selectedFile);
    });
});

// Create menu template
const mainMenuTemplate = [
    {
        label: "Dev",
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
        }
    }
];

// If Mac, add empty object to menu
if (process.platform == "darwin") {
    mainMenuTemplate.unshift({
        label: ""
    });
}

// Create new BrowserWindow
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 640,
        height: 480,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load html into window
    mainWindow.loadFile("mainWindow.html");

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);

    // Close App if window is closed
    mainWindow.on("closed", () => {
        app.quit();
    });
}

// Listen for app to be ready
app.whenReady().then(createWindow);

// Listen for all windows to be closed
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
