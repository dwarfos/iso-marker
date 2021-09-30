const { ipcRenderer } = require("electron");
const https = require("https");
const fs = require("fs");

// global var
let filePath;
let windowInstance;

// FE funcs
const fileProgressBar = (percents) => {
  document.querySelector("#progress-bar").style.width = percents + "%";
};

const fileDataHide = () => {
  fileProgressBar(0);
  document.querySelector("#file-data").style.display = "none";
  ipcRenderer.send("event:file-data-hide"); // send event to Win management process to resize mainWindow
};

const fileDataShow = () => {
  fileProgressBar(100);
  ipcRenderer.send("event:file-data-show"); // send event to Win management process to resize mainWindow
  document.querySelector("#file-data").style.display = "block";
};

const onFilePath = () => {
  fileDataHide();
  document.querySelector("#file-path").innerHTML = filePath;
  document.querySelector("#file-open").disabled = true;
  document.querySelector("#file-save").disabled = true;
  document.querySelector("#account-set").disabled = true;
};

const fileProgressDownload = (percents) => {
  if (percents == 0) onFilePath();
  fileProgressBar(percents);
  document.querySelector(
    "#progress-status"
  ).innerHTML = `Downloading ISO... ${percents}%`;
};

const fileProgressLoading = () => {
  onFilePath();
  document.querySelector("#progress-status").innerHTML =
    "Searching for File Offset...";
};

const onFileOffsetNotFound = () => {
  fileProgressBar(0);
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

function FileProgress(fileSize, download) {
  this.fileSize = fileSize;
  this.bytesInPercent = Math.round(fileSize / 100);
  this.bytesChecked = 0;
  this.lastPercent = 0;
  this.init = download ? fileProgressDownload : fileProgressLoading;
  this.notify = download ? fileProgressDownload : fileProgressBar;
  this.update = function (chunk) {
    this.bytesChecked += chunk.length;
    const percents =
      (this.bytesChecked - (this.bytesChecked % this.bytesInPercent)) /
      this.bytesInPercent;
    if (this.lastPercent != percents) this.notify(percents); // update status
    this.lastPercent = percents;
  };
  this.init(0);
}

import("./lib/window-handler.mjs").then((mjs) => {
  const { WindowHandler } = mjs;
  windowInstance = WindowHandler.newInstance(null, FileProgress);
});

const onFileOpen = async (e, data) => {
  windowInstance.selectedFile = filePath = data;
  windowInstance.accountFound
    .then((accountFound) => {
      onFileOffsetFound(accountFound, windowInstance.accountOffset);
    })
    .catch((e) => {
      onFileOffsetNotFound();
    });
};

const onAccountSet = () => {
  windowInstance.account = document.querySelector("#account-field").value;
  onFileOpen(undefined, filePath);
};

const onFileSave = (e, data) => {
  filePath = data; // save new selected file path
  fileProgressDownload(0);
  const options = {
    hostname: "dwarfos.com",
    port: 443,
    path: "/downloads/dwarfos.iso",
    method: "GET",
  };
  https
    .get(options, (res) => {
      const progress = new FileProgress(res.headers["content-length"], true);
      res.pipe(fs.createWriteStream(filePath));
      res.on("data", (chunk) => progress.update(chunk));
      res.on("end", () => onFileOpen(undefined, filePath));
    })
    .on("error", (e) => console.error(e));
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
