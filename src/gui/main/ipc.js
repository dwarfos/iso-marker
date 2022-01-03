// wtf
// redo to .. send/on -> invoke/handle ... below example
//
// Renderer process
//ipcRenderer.invoke('some-name', someArgument).then((result) => {
//  // ...
//})
// Main process
//ipcMain.handle('some-name', async (event, someArgument) => {
//  const result = await doSomeWork(someArgument)
//  return result
//})
// Main process
//ipcMain.handle('my-invokable-ipc', async (event, ...args) => {
//  const result = await somePromise(...args)
//  return result
//})
// Renderer process
//async () => {
//  const result = await ipcRenderer.invoke('my-invokable-ipc', arg1, arg2)
//  // ...
//}
// event handlers must be exportwd out of this file.

const { ipcMain } = require("electron");

class MainIpc {
  //constructor() {}
  static onFilePath = (window) => {
    return (filePath) => window.send("filePath", filePath);
  };

  static onLoading = (window) => {
    return () => window.send("loading");
  };

  static onDownloading = (window) => {
    return (percents) => window.send("downloading", percents);
  };

  static set onOpenFile(onOpenFile) {
    ipcMain.handle("open-file", onOpenFile);
  }

  static set onSetAccount(onSetAccount) {
    ipcMain.handle("set-file", onSetAccount);
  }

  static set onSaveFile(onSaveFile) {
    ipcMain.handle("save-file", onSaveFile);
  }
}

module.exports = { MainIpc };
