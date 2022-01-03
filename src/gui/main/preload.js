// simply loads renderer ipc in preload when main app process is creating renderer window
// renderer process will have no node integration, therefore ipc methods class must be hooked on
// window.appApi in renderer process
const { contextBridge } = require("electron");
const { RendererIpc } = require("../renderer/ipc.js");
const { RendererWindow } = require("../renderer/window.js");
const { RendererApp } = require("../renderer/app.js");

RendererIpc.onLoading = RendererWindow.loadingStatus;
RendererIpc.onDownloading = RendererWindow.downloadingProgress;
RendererIpc.onFilePath = RendererWindow.onFilePath;

class Renderer {
  static newAccount = () => document.querySelector("#account-field").value;

  static openFile = async () => {
    await RendererApp.handleOpenFile(
      RendererIpc.openFile(),
      RendererWindow.onFileOffsetFound,
      RendererWindow.onFileOffsetNotFound
    );
  };

  static setAccount = async (newAccount) => {
    await RendererApp.handleSetAccount(
      RendererIpc.setAccount(newAccount),
      RendererWindow.onFileOffsetFound
    );
  };

  static saveFile = async () => {
    await RendererApp.handleSaveFile(
      RendererIpc.saveFile(),
      RendererWindow.onFileOffsetFound
    );
  };
}

contextBridge.exposeInMainWorld("openFile", () => Renderer.openFile());
contextBridge.exposeInMainWorld("newAccount", () => Renderer.newAccount());
contextBridge.exposeInMainWorld("setAccount", (newAccount) =>
  Renderer.setAccount(newAccount)
);
contextBridge.exposeInMainWorld("saveFile", () => Renderer.saveFile());

//RendererIpc.openFile().then(RendererWindow.onFileOpen);
