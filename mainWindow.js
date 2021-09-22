const { ipcRenderer } = require("electron");
const https = require("https");
const fs = require("fs");

// global var
let filePath;
let accountOffset;

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
  this.update = function (chunkSize) {
    this.bytesChecked += chunkSize;
    const percents =
      (this.bytesChecked - (this.bytesChecked % this.bytesInPercent)) /
      this.bytesInPercent;
    if (this.lastPercent != percents) this.notify(percents); // update status
    this.lastPercent = percents;
  };
  this.init(0);
}

const onFileSave = (e, data) => {
  filePath = data; // save new selected file path
  const options = {
    hostname: "dwarfos.com",
    port: 443,
    path: "/downloads/dwarfos.iso",
    method: "GET",
  };
  const file = fs.createWriteStream(filePath);
  https
    .get(options, (res) => {
      const fileSize = res.headers["content-length"];
      const progress = new FileProgress(fileSize, true);
      res.pipe(file);
      res.on("data", (chunk) => progress.update(chunk.length));
      res.on("end", () => onFileOpen(undefined, filePath));
    })
    .on("error", (e) => console.error(e));
};

const onFileOpen = (e, data) => {
  filePath = data; // save new selected file path
  let found = false;
  const size = fs.statSync(filePath).size;
  const progress = new FileProgress(size);
  const readInterface = fs.createReadStream(filePath, {
    highWaterMark: 1048576,
    encoding: "latin1",
  });
  readInterface.on("data", (chunk) => {
    progress.update(chunk.length);
    const search = chunk.search("dwaccount=");
    if (search === -1) return;
    found = true;
    readInterface.destroy();
    const accountChunk = chunk
      .substring(search + 10, search + 32)
      .split("\n")[0];
    const accountFound =
      accountChunk == "0000000000000000000000" ? "" : accountChunk;
    accountOffset = progress.bytesChecked - chunk.length + search + 10;
    onFileOffsetFound(accountFound);
  });
  readInterface.on("close", () => {
    if (found !== false) return; // test this
    accountOffset = undefined;
    onFileOffsetNotFound();
  });
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
