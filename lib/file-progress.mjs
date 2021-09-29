// not used - skip
class FileProgress {
  constructor(fileSize) {
    if (fileSize) this.fileSize = fileSize;
    this.bytesInPercent = Math.round(fileSize / 100);
    this.bytesChecked = 0;
    this.lastPercent = 0;
  }

  init(download) {
    const initial = download
      ? window.fileProgressDownload(0)
      : window.fileProgressLoading();
    initial;
  }

  update(chunkSize, download) {
    this.bytesChecked += chunkSize;
    const percents =
      (this.bytesChecked - (this.bytesChecked % this.bytesInPercent)) /
      this.bytesInPercent;
    if (this.lastPercent != percents) {
      window.fileProgressBar(percents);
      if (download) window.fileProgressDownload(percents);
    }
    this.lastPercent = percents;
  }
}

export { FileProgress };
