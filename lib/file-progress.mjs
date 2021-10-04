class Progress {
  fileSize = null;
  bytesInPercent = null;
  bytesChecked = null;
  lastPercent = null;

  constructor(fileSize = null, download = false) {
    this.fileSize = fileSize;
    this.bytesInPercent = Math.round(fileSize / 100);
    this.bytesChecked = 0;
    this.lastPercent = 0;
    this.download = download;
    this.download ? fileProgressDownload(0) : fileProgressLoading();
  }

  update(chunk = null) {
    this.bytesChecked += chunk.length;
    const percents =
      (this.bytesChecked - (this.bytesChecked % this.bytesInPercent)) /
      this.bytesInPercent;
    if (this.lastPercent != percents) {
      fileProgressBar(percents);
      if (this.download) fileProgressDownload(percents);
    }
    this.lastPercent = percents;
  }
}

export { Progress };
