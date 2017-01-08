import {Arrays} from 'external/gs_tools/src/collection';
import {DomEvent} from 'external/gs_tools/src/event';
import {inject} from 'external/gs_tools/src/inject';
import {
  ArrayParser,
  bind,
  customElement,
  DomBridge,
  handle,
  StringParser} from 'external/gs_tools/src/webc';

import {BaseThemedElement} from '../common/base-themed-element';
import {ThemeService} from '../theming/theme-service';
import {Switch} from '../tool/switch';

import {FileService} from './file-service';


/**
 * Component to attach files.
 */
@customElement({
  dependencies: [FileService, Switch],
  tag: 'gs-file-input',
  templateKey: 'src/input/file-input',
})
export class FileInput extends BaseThemedElement {
  @bind(null).attribute('gs-bundle-id', StringParser)
  private readonly gsBundleIdBridge_: DomBridge<string>;

  @bind(null).attribute('gs-mime-types', ArrayParser(StringParser))
  private readonly gsMimeTypesBridge_: DomBridge<string[]>;

  @bind('#initialMessage').innerText()
  private readonly initialMessageInnerTextBridge_: DomBridge<string>;

  @bind('#droppedMessage').innerText()
  private readonly droppedMessageInnerTextBridge_: DomBridge<string>;

  @bind('#switch').attribute('gs-value', StringParser)
  private readonly switchGsValueBridge_: DomBridge<string>;

  private readonly fileService_: FileService;

  private deleteBundleFn_: (() => void) | null;
  private dragDepth_: number;

  constructor(
      @inject('gs.input.FileService') fileService: FileService,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.deleteBundleFn_ = null;
    this.dragDepth_ = 0;
    this.droppedMessageInnerTextBridge_ = DomBridge.of<string>();
    this.fileService_ = fileService;
    this.gsBundleIdBridge_ = DomBridge.of<string>();
    this.gsMimeTypesBridge_ = DomBridge.of<string[]>();
    this.initialMessageInnerTextBridge_ = DomBridge.of<string>();
    this.switchGsValueBridge_ = DomBridge.of<string>();
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

  /**
   * @param dataTransfer Data transfer object to validate.
   * @return True iff the given data transfer object is valid.
   */
  private isValid_(dataTransfer: DataTransfer): boolean {
    let mimeTypesArray = this.gsMimeTypesBridge_.get();
    if (mimeTypesArray === null) {
      return true;
    }

    let mimeTypesSet = new Set(mimeTypesArray);
    return Arrays
        .fromNumericIndexable(dataTransfer.items)
        .every((item: DataTransferItem) => {
          return mimeTypesSet.has(item.type);
        });
  }

  @handle('#root').event(DomEvent.DRAGOVER)
  protected onDragover_(event: DragEvent): void {
    event.preventDefault();
    if (this.isValid_(event.dataTransfer)) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  @handle('#root').event(DomEvent.DRAGENTER)
  protected onDragEnter_(event: DragEvent): void {
    this.dragDepth_++;
    if (this.dragDepth_ > 0) {
      if (this.isValid_(event.dataTransfer)) {
        this.switchGsValueBridge_.set('dragging');
      } else {
        this.switchGsValueBridge_.set('error');
      }
    }
  }

  @handle('#root').event(DomEvent.DRAGLEAVE)
  protected onDragLeave_(): void {
    this.dragDepth_--;
    if (this.dragDepth_ <= 0) {
      let files = this.getFiles_();
      if (files === null || files.length <= 0) {
        this.switchGsValueBridge_.set('initial');
      } else {
        this.switchGsValueBridge_.set('dropped');
      }
    }
  }

  @handle('#root').event(DomEvent.DROP)
  protected onDrop_(event: DragEvent): boolean {
    this.onDragLeave_();
    event.preventDefault();
    event.stopPropagation();
    if (this.isValid_(event.dataTransfer)) {
      if (this.deleteBundleFn_ !== null) {
        this.deleteBundleFn_();
      }

      let {id, deleteFn} =
          this.fileService_.addBundle(Arrays.fromItemList(event.dataTransfer.files).asArray());
      this.deleteBundleFn_ = deleteFn;
      this.gsBundleIdBridge_.set(id);
    }

    return false;
  }

  @handle(null).attributeChange('gs-bundle-id', StringParser)
  protected onGsBundleIdChanged_(newValue: string | null, oldValue: string | null): void {
    if (this.deleteBundleFn_ !== null && oldValue !== null) {
      this.deleteBundleFn_();
    }

    let files = this.getFiles_();
    if (files === null) {
      this.switchGsValueBridge_.set('initial');
      return;
    }

    this.switchGsValueBridge_.set('dropped');

    // TODO: sort the file names.
    let fileNames = Arrays
        .of(files)
        .map((file: File) => {
          return file.name;
        })
        .asArray()
        .join(', ');
    // TODO: Differentiate between 1 attachment vs multiple.
    this.droppedMessageInnerTextBridge_.set(`Added file(s): ${fileNames}`);
  }

  /**
   * Updates the display elements.
   */
  @handle(null).attributeChange('gs-label', StringParser)
  protected onGsLabelChanged_(label: string | null): void {
    this.initialMessageInnerTextBridge_.set(label || 'Drop a file here to upload');
  }
}
