// must return class with create electron window methods and etc. // doesnt work atm
// must create instance of window for main electron process

const { BrowserWindow, Menu } = require("electron");
const path = require("path");

class MainWindow {
  static windowTemplate = {
    width: 640,
    height: 275,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  };

  // Create menu template
  static menuTemplate = [
    {
      label: "Dev",
      click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      },
    },
  ];

  // Func used to create new BrowserWindow obj that is named mainWindow.
  static createWindow(windowTemplate) {
    return new BrowserWindow(windowTemplate);
  }

  static createMenu = (menuTemplate) => {
    if (process.platform == "darwin") {
      menuTemplate.unshift({
        label: "",
      });
    }

    // Build menu from template
    return Menu.buildFromTemplate(menuTemplate);
  };

  static loadWindow(window, menu) {
    // Load html into mainWindow
    window.loadFile(path.join(__dirname, "../renderer/window.html"));
    Menu.setApplicationMenu(menu);
  }

  // Resizes Main Window with given width and height. Used w/file-data show/hide in FE
  static resizeWindow = (window, width, height) => {
    window.setMinimumSize(width, height);
    window.setSize(width, height);
  };

  static getAllWindows() {
    return BrowserWindow.getAllWindows();
  }

  window = null;
  constructor() {
    const mainMenu = this.constructor.createMenu(this.constructor.menuTemplate);
    this.window = this.constructor.createWindow(
      this.constructor.windowTemplate
    );
    this.constructor.loadWindow(this.window, mainMenu);
  }
}

module.exports = { MainWindow };
