const { dialog } = require("electron");
const path = require("path");

class MainApp {
  static openDialog = async (window) =>
    dialog
      .showOpenDialog(window, {
        defaultPath: __dirname,
        properties: ["openFile"],
      })
      .then((result) => result)
      .catch((err) => err);

  static expand = (mainWindow) =>
    mainWindow.constructor.resizeWindow(mainWindow.window, 640, 545);
  static shrink = (mainWindow) =>
    mainWindow.constructor.resizeWindow(mainWindow.window, 640, 330);

  static onOffset = async (windowHandler, offset) => {
    this.expand(windowHandler.mainWindow);
    windowHandler.onOffset(windowHandler.filePath, offset);
  };

  static onPathLoad = async (windowHandler, filePath) => {
    windowHandler.filePath = filePath;
    this.shrink(windowHandler.mainWindow);

    const offset = await windowHandler.offset;
    if (typeof offset !== "string" && offset !== null)
      this.onOffset(windowHandler, offset);
    return offset;
  };

  static onOpenFile = async (windowHandler) => {
    const result = await this.openDialog(windowHandler.mainWindow.window);
    if (result.canceled) return result;

    return await this.onPathLoad(windowHandler, result.filePaths[0]);
  };

  static onSetAccount = async (windowHandler, newAccount) => {
    windowHandler.account = newAccount;
    return await this.onPathLoad(windowHandler, windowHandler.filePath);
  };

  static saveDialog = async (window) =>
    dialog
      .showSaveDialog(window, {
        defaultPath: path.join(__dirname, "dwarfos"),
        properties: ["openFile", "openDirectory", "showOverwriteConfirmation"],
      })
      .then((result) => result)
      .catch((err) => err);

  static onPathSave = async (windowHandler, filePath) => {
    windowHandler.filePath = filePath;
    this.shrink(windowHandler.mainWindow);

    const download = await windowHandler.download;
    if (typeof download !== "string" && download !== null)
      return await this.onPathLoad(windowHandler, download.filePath);
  };

  static onSaveFile = async (windowHandler) => {
    const result = await this.saveDialog(windowHandler.mainWindow.window);
    if (result.canceled) return result;
    const filePathExt = path.extname(result.filePath);
    if (filePathExt === "" || filePathExt === ".") result.filePath += ".iso";

    return await this.onPathSave(windowHandler, result.filePath);
  };
}

module.exports = { MainApp };
