class RendererWindow {
  static get progress() {
    return document.querySelector("#progress");
  }

  static set progress(className) {
    this.progress.className = className;
    if (className == "reset") this.progress.style.width = "";
  }

  static set progressStatus(status) {
    document.querySelector("#progress-status").innerHTML = status;
  }

  static loadingStatus = () => {
    this.progressStatus = "Searching for File Offset...";
    this.progress = "slow";
  };

  static downloadingProgress = (e, percents) => {
    if (this.progress.className == "slow") return;
    this.progress = "";
    this.progress.style.width = `${percents}%`;
    this.progressStatus = `Downloading ISO... ${percents}%`;
  };

  static onFilePath = (e, filePath) => {
    this.progress = "reset";

    document.querySelector("#file-data").style.display = "none";
    document.querySelector("#file-path").innerHTML = filePath;

    document.querySelector("#file-open").disabled = true;
    document.querySelector("#file-save").disabled = true;
    document.querySelector("#account-set").disabled = true;
  };

  static onFileOffsetNotFound = (failure) => {
    this.progress = "reset";
    this.progressStatus = failure;

    document.querySelector("#file-open").disabled = false;
    document.querySelector("#file-save").disabled = false;
    document.querySelector("#account-set").disabled = true;
  };

  static onFileOffsetFound = ({
    account: accountFound,
    mark: accountOffset,
  }) => {
    this.progress = "done";
    this.progressStatus = "File Offset Successfully Found!";

    document.querySelector("#file-data").style.display = "block";
    document.querySelector("#account-found").innerHTML = accountFound;
    document.querySelector("#account-offset").innerHTML = accountOffset
      .toString(16)
      .toUpperCase();

    document.querySelector("#file-open").disabled = false;
    document.querySelector("#file-save").disabled = false;
    document.querySelector("#account-set").disabled = false;
  };

  static onFileOpen = (filePath) => console.log(filePath);
}

module.exports = { RendererWindow };
