const { ipcRenderer } = require("electron");

class RendererIpc {
  static openFile() {
    return ipcRenderer.invoke("open-file");
  }

  static setAccount(newAccount) {
    return ipcRenderer.invoke("set-file", newAccount);
  }

  static saveFile() {
    return ipcRenderer.invoke("save-file");
  }

  static set onLoading(loadingStatus) {
    ipcRenderer.on("loading", loadingStatus);
  }

  static set onDownloading(downloadingProgress) {
    ipcRenderer.on("downloading", downloadingProgress);
  }

  static set onFilePath(onFilePath) {
    ipcRenderer.on("filePath", onFilePath);
  }
}

module.exports = { RendererIpc };
