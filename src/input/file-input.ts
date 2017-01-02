import {Arrays} from 'external/gs_tools/src/collection';
import {DomEvent} from 'external/gs_tools/src/event';
import {inject} from 'external/gs_tools/src/inject';
import {bind, customElement, DomBridge, handle, StringParser} from 'external/gs_tools/src/webc';

import {BaseThemedElement} from '../common/base-themed-element';
import {ThemeService} from '../theming/theme-service';

import {FileService} from './file-service';


/**
 * Component to attach files.
 */
@customElement({
  dependencies: [FileService],
  tag: 'gs-file-input',
  templateKey: 'src/input/file-input',
})
export class FileInput extends BaseThemedElement {
  @bind(null).attribute('gs-bundle-id', StringParser)
  private readonly gsBundleIdBridge_: DomBridge<string>;

  @bind(null).attribute('gs-label', StringParser)
  private readonly gsLabelBridge_: DomBridge<string>;

  @bind('#message').innerText()
  private readonly messageInnerTextBridge_: DomBridge<string>;

  @bind('#icon').innerText()
  private readonly iconInnerTextBridge_: DomBridge<string>;

  private readonly fileService_: FileService;

  private deleteBundleFn_: (() => void) | null;

  constructor(
      @inject('gs.input.FileService') fileService: FileService,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.deleteBundleFn_ = null;
    this.gsBundleIdBridge_ = DomBridge.of<string>();
    this.gsLabelBridge_ = DomBridge.of<string>();
    this.fileService_ = fileService;
    this.iconInnerTextBridge_ = DomBridge.of<string>();
    this.messageInnerTextBridge_ = DomBridge.of<string>();
  }

  /**
   * @return Files that have been attached, or null if there are none.
   */
  private getFiles_(): File[] | null {
    let bundleId = this.gsBundleIdBridge_.get();
    if (bundleId === null) {
      return null;
    }

    return this.fileService_.getBundle(bundleId);
  }

  private isValid_(dataTransfer: DataTransfer): boolean {
    // TODO: Actually does the check.
    return true;
  }

  /**
   * Updates the display elements.
   */
  @handle(null).attributeChange('gs-label', StringParser)
  private updateDisplay_(): void {
    let files = this.getFiles_();
    if (files === null || files.length <= 0) {
      this.messageInnerTextBridge_.set(this.gsLabelBridge_.get() || 'Drop a file here to upload');
      this.iconInnerTextBridge_.set('file_upload');
    } else {
      // TODO: sort the file names.
      let fileNames = Arrays
          .of(files)
          .map((file: File) => {
            return file.name;
          })
          .asArray()
          .join(', ');
      // TODO: Differentiate between 1 attachment vs multiple.
      this.messageInnerTextBridge_.set(`Added file(s): ${fileNames}`);
      this.iconInnerTextBridge_.set('insert_drive_file');
    }
  }

  @handle('#root').event(DomEvent.DRAGOVER)
  protected onDragover_(event: DragEvent): void {
    if (this.isValid_(event.dataTransfer)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  @handle('#root').event(DomEvent.DROP)
  protected onDrop_(event: DragEvent): void {
    if (this.isValid_(event.dataTransfer)) {
      event.preventDefault();

      if (this.deleteBundleFn_ !== null) {
        this.deleteBundleFn_();
      }

      let {id, deleteFn} =
          this.fileService_.addBundle(Arrays.fromFileList(event.dataTransfer.files).asArray());
      this.deleteBundleFn_ = deleteFn;
      this.gsBundleIdBridge_.set(id);
    }
  }

  @handle(null).attributeChange('gs-bundle-id', StringParser)
  protected onGsBundleIdChanged_(): void {
    if (this.deleteBundleFn_ !== null) {
      this.deleteBundleFn_();
    }
    this.updateDisplay_();
  }
}
