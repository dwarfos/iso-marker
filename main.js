const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");

// dev v
let test = function () {};
import("./lib/window-handler.mjs").then((module) => {
  const { WindowHandler } = module;
  test = async (iso) => {
    const windowInstance = WindowHandler.newInstance(iso);
    const accountFound = await windowInstance.accountFound; // looks for account on instance filePath;
    const accountOffset = windowInstance.accountOffset; // offset of found account within given filePath;
    console.log(accountFound);
    console.log(accountOffset);
  };
});
// dev ^

// Win funcs
let mainWindow; // the one and only window variable used in this app.

// 'SaveFile Dialog' trigger for processing 'Save ISO' button click event emitted from Renderer.
ipcMain.on("event:file-save-click", () =>
  dialog
    .showSaveDialog(mainWindow, {
      defaultPath: path.join(__dirname, "dwarfos.iso"),
      properties: ["openFile", "openDirectory", "showOverwriteConfirmation"],
    })
    .then((result) => {
      if (result.canceled) return;
      mainWindow.webContents.send("event:file-data-hide"); // prevents visual glitch
      resizeWindow(640, 330);
      mainWindow.webContents.send("event:file-save", result.filePath);
    })
    .catch((err) => console.log(err))
);

// 'OpenFile Dialog' trigger for processing 'Choose ISO' button click event emitted from Renderer.
ipcMain.on("event:file-open-click", () =>
  dialog
    .showOpenDialog(mainWindow, {
      defaultPath: __dirname,
      properties: ["openFile"],
    })
    .then((result) => {
      if (result.canceled) return;
      test(result.filePaths[0]); // dev call
      mainWindow.webContents.send("event:file-data-hide"); // prevents visual glitch
      resizeWindow(640, 330);
      mainWindow.webContents.send("event:file-open", result.filePaths[0]);
    })
    .catch((err) => console.log(err))
);

// Triggers for resizing mainWindow when file-data display is being manipulated.
ipcMain.on("event:file-data-show", () => resizeWindow(640, 545));
ipcMain.on("event:file-data-hide", () => resizeWindow(640, 330));

// Create menu template
const mainMenuTemplate = [
  {
    label: "Dev",
    click(item, focusedWindow) {
      focusedWindow.toggleDevTools();
    },
  },
];

// If Mac, add empty object to menu
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({
    label: "",
  });
}

// Func used to create new BrowserWindow obj that is named mainWindow.
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 275,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load html into mainWindow
  mainWindow.loadFile("mainWindow.html");

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  // Kill Main App process if the mainWindow is closed.
  mainWindow.on("closed", () => {
    app.quit();
  });
}

// Resizes Main Window with given width and height. Used w/file-data show/hide in FE
function resizeWindow(width, height) {
  mainWindow.setMinimumSize(width, height);
  mainWindow.setSize(width, height);
}

// Listen for app to be ready
app.whenReady().then(createWindow);

// Listen for all windows to be closed, terminate the app process if that happens.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Listen for the main app process to be active, spawn mainWindow if no windows are present..
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
