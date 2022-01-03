const { app } = require("electron");

const { MainIpc } = require("./main/ipc.js");
const { MainWindow } = require("./main/window.js");
const { MainApp } = require("./main/app.js");

const { WindowHandler } = require("./lib/window-handler.js");

class Main {
  static createMainWindow = () => {
    const mainWindow = new MainWindow();
    mainWindow.window.on("closed", () => app.quit());

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    return mainWindow;
  };

  static get allWindows() {
    return MainWindow.getAllWindows();
  }

  windowHandler = null;
  constructor() {
    this.windowHandler = new WindowHandler(this.constructor.createMainWindow());
    this.windowHandler.loadingStatus = MainIpc.onLoading(
      this.windowHandler.mainWindow.window
    );
    this.windowHandler.onDownloadProgress = MainIpc.onDownloading(
      this.windowHandler.mainWindow.window
    );
    this.windowHandler.onFilePath = MainIpc.onFilePath(
      this.windowHandler.mainWindow.window
    );
    MainIpc.onOpenFile = () => MainApp.onOpenFile(this.windowHandler);
    MainIpc.onSetAccount = (e, newAccount) =>
      MainApp.onSetAccount(this.windowHandler, newAccount);
    MainIpc.onSaveFile = () => MainApp.onSaveFile(this.windowHandler);
  }
}

app.whenReady().then(() => new Main()); //
app.on("activate", () => {
  if (Main.allWindows.length === 0) {
    new Main(); // todo to another func; i don't like it.
  }
});
