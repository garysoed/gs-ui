import { bind, inject } from 'external/gs_tools/src/inject';


@bind('gs.tool.DownloadService')
export class DownloadService {
  private linkEl_: HTMLAnchorElement | null;
  private readonly window_: Window;

  constructor(@inject('x.dom.window') window: Window) {
    this.linkEl_ = null;
    this.window_ = window;
  }

  /**
   * Creates a new instance of the Blob.
   * @param parts Parts of the blob.
   * @param options
   * @return New instance of the blob.
   */
  private createBlob_(parts: any[], options: BlobPropertyBag): Blob {
    return new Blob(parts, options);
  }

  /**
   * @return The link element used for downloading.
   */
  private getLinkEl_(): HTMLAnchorElement {
    if (this.linkEl_ !== null) {
      return this.linkEl_;
    }

    const linkEl = this.window_.document.createElement('a');
    linkEl.target = '_blank';
    this.linkEl_ = linkEl;
    return linkEl;
  }

  /**
   * Downloads the given blob.
   * @param blob Blob to download.
   * @param filename Name of file to download the blob as.
   */
  download(blob: Blob, filename: string): void {
    const url = this.window_.URL.createObjectURL(blob);
    const linkEl = this.getLinkEl_();
    linkEl.download = filename;
    linkEl.href = url;
    linkEl.click();
    this.window_.URL.revokeObjectURL(url);
  }

  /**
   * Downloads the given JSON.
   * @param json The JSON to download.
   * @param filename Name of file to download the JSON as.
   */
  downloadJson(json: gs.IJson, filename: string): void {
    const blob = this.createBlob_(
        [JSON.stringify(json, null)],
        {type: 'application/json'});
    this.download(blob, filename);
  }
}
// TODO: Mutable
