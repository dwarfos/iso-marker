const { ipcRenderer } = require("electron");

// dev
let windowInstance;

import("./lib/window-handler.mjs").then((mjs) => {
  const { WindowHandler } = mjs;
  windowInstance = new WindowHandler();
});

const fileDataHide = () => {
  document.querySelector("#progress-bar").style.width = 0 + "%";
  document.querySelector("#file-data").style.display = "none";
  ipcRenderer.send("event:file-data-hide"); // send event to Win management process to resize mainWindow
};

const fileDataShow = () => {
  document.querySelector("#progress-bar").style.width = 100 + "%";
  ipcRenderer.send("event:file-data-show"); // send event to Win management process to resize mainWindow
  document.querySelector("#file-data").style.display = "block";
};

const onFilePath = (filePath) => {
  fileDataHide();
  document.querySelector("#file-path").innerHTML = filePath;
  document.querySelector("#file-open").disabled = true;
  document.querySelector("#file-save").disabled = true;
  document.querySelector("#account-set").disabled = true;
};

const onFileOffsetNotFound = () => {
  fileDataHide();
  document.querySelector("#progress-status").innerHTML =
    "File Offset Not Found!";

  document.querySelector("#file-open").disabled = false;
  document.querySelector("#file-save").disabled = false;
  document.querySelector("#account-set").disabled = true;
};

const onFileOffsetFound = (accountFound, accountOffset) => {
  fileDataShow();
  document.querySelector("#progress-status").innerHTML =
    "File Offset Successfully Found!";
  document.querySelector("#account-found").innerHTML = accountFound;
  document.querySelector("#account-offset").innerHTML = accountOffset
    .toString(16)
    .toUpperCase();

  document.querySelector("#file-open").disabled = false;
  document.querySelector("#file-save").disabled = false;
  document.querySelector("#account-set").disabled = false;
};

const onFileOpen = async (e, filePath) => {
  onFilePath((windowInstance.filePath = filePath));
  windowInstance.account
    .then((accountFound) => {
      onFileOffsetFound(accountFound, windowInstance.accountOffset);
    })
    .catch((e) => {
      //console.log(e);
      onFileOffsetNotFound();
    });
};

const onAccountSet = () => {
  windowInstance.account = document.querySelector("#account-field").value;
  onFileOpen(undefined, windowInstance.filePath);
};

const onFileSave = async (e, filePath) => {
  onFilePath((windowInstance.filePath = filePath));
  windowInstance.download
    .then((filePath) => {
      onFileOpen(undefined, filePath);
    })
    .catch((e) => {
      console.log(e);
    });
};

// Set triggers for button OnClicks.
// file-open/file-save emitts event for Main to show File Open/Save Dialog.
// file-set calls onAccountSet arrow function that writes new account using global vars, to filePath at accountOffset.
document
  .querySelector("#file-open")
  .addEventListener("click", () => ipcRenderer.send("event:file-open-click"));
document
  .querySelector("#file-save")
  .addEventListener("click", () => ipcRenderer.send("event:file-save-click"));
document.querySelector("#account-set").addEventListener("click", onAccountSet);

// Set triggers
ipcRenderer.on("event:file-open", onFileOpen);
ipcRenderer.on("event:file-save", onFileSave);
ipcRenderer.on("event:file-data-hide", fileDataHide);
