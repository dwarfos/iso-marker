const { ipcRenderer } = require("electron");
const https = require("https");
const fs = require("fs");

// global var
let filePath;
let accountOffset;
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

const onFileOffsetFound = (accountFound) => {
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

// dev v
import("./lib/window-handler.mjs").then((mjs) => {
  const { WindowHandler } = mjs;
  windowInstance = WindowHandler.newInstance(null, FileProgress);
});
// dev ^

const onFileOpen = async (e, data) => {
  windowInstance.selectedFile = filePath = data;
  windowInstance.accountFound
    .then((accountFound) => {
      accountOffset = windowInstance.accountOffset;
      onFileOffsetFound(accountFound);
    })
    .catch((e) => {
      console.log(e);
      onFileOffsetNotFound();
    });

  //const size = fs.statSync(filePath).size;
  //const progress = new FileProgress(size);
  //progress.update(chunk.length);
};

const onAccountSet = () => {
  const account = document.querySelector("#account-field").value; // read new account from input
  //if (account == "") account = "000000000000000000000000";  //
  let bufferCharArray = [];
  const accountCharArray = account.split("");
  let nlPos;
  for (let charPos = 0; charPos < 24; charPos++) {
    if (accountCharArray[charPos] !== undefined) {
      bufferCharArray.push(accountCharArray[charPos]);
      continue;
    }
    if (nlPos === undefined) {
      nlPos = charPos;
      bufferCharArray.push("\n");
      continue;
    }
    bufferCharArray.push("0");
  }
  const bufferAccount = bufferCharArray.join("");
  const buf = new Buffer.from(bufferAccount, ["latin1"]);
  const write = fs.openSync(filePath, "r+");
  fs.writeSync(write, buf, 0, buf.length, accountOffset);
  fs.close(write, () => onFileOpen(undefined, filePath)); // account was set - reload file
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
