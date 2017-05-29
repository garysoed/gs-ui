import { DomEvent } from 'external/gs_tools/src/event';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { ListParser, StringParser } from 'external/gs_tools/src/parse';
import {
  customElement,
  dom,
  DomHook,
  handle,
  hook,
  onDom} from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { FileService } from '../input/file-service';
import { ThemeService } from '../theming/theme-service';
import { Switch } from '../tool/switch';


const BUNDLE_ID_ATTRIBUTE = {name: 'gs-bundle-id', parser: StringParser, selector: null};
const LABEL_ATTRIBUTE = {name: 'gs-label', parser: StringParser, selector: null};


/**
 * Component to attach files.
 */
@customElement({
  dependencies: ImmutableSet.of([FileService, Switch]),
  tag: 'gs-file-input',
  templateKey: 'src/input/file-input',
})
export class FileInput extends BaseThemedElement {
  private deleteBundleFn_: (() => void) | null;
  private dragDepth_: number;

  @hook('#droppedMessage').innerText()
  private readonly droppedMessageInnerTextHook_: DomHook<string>;

  private readonly fileService_: FileService;

  @hook(null).attribute('gs-bundle-id', StringParser)
  private readonly gsBundleIdHook_: DomHook<string>;

  @hook(null).attribute('gs-mime-types', ListParser(StringParser))
  private readonly gsMimeTypesHook_: DomHook<ImmutableList<string>>;

  @hook('#initialMessage').innerText()
  private readonly initialMessageInnerTextHook_: DomHook<string>;

  @hook('#switch').attribute('gs-value', StringParser)
  private readonly switchGsValueHook_: DomHook<string>;

  constructor(
      @inject('gs.input.FileService') fileService: FileService,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.deleteBundleFn_ = null;
    this.dragDepth_ = 0;
    this.droppedMessageInnerTextHook_ = DomHook.of<string>();
    this.fileService_ = fileService;
    this.gsBundleIdHook_ = DomHook.of<string>();
    this.gsMimeTypesHook_ = DomHook.of<ImmutableList<string>>();
    this.initialMessageInnerTextHook_ = DomHook.of<string>();
    this.switchGsValueHook_ = DomHook.of<string>();
  }

  /**
   * @return Files that have been attached, or null if there are none.
   */
  private getFiles_(): File[] | null {
    const bundleId = this.gsBundleIdHook_.get();
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
    const mimeTypesArray = this.gsMimeTypesHook_.get();
    if (mimeTypesArray === null) {
      return true;
    }

    const mimeTypesSet = new Set(mimeTypesArray);
    return ImmutableList
        .of(dataTransfer.items)
        .every((item: DataTransferItem) => {
          return mimeTypesSet.has(item.type);
        });
  }

  @handle('#root').event(DomEvent.DRAGENTER)
  protected onDragEnter_(event: DragEvent): void {
    this.dragDepth_++;
    if (this.dragDepth_ > 0) {
      if (this.isValid_(event.dataTransfer)) {
        this.switchGsValueHook_.set('dragging');
      } else {
        this.switchGsValueHook_.set('error');
      }
    }
  }

  @handle('#root').event(DomEvent.DRAGLEAVE)
  protected onDragLeave_(): void {
    this.dragDepth_--;
    if (this.dragDepth_ <= 0) {
      const files = this.getFiles_();
      if (files === null || files.length <= 0) {
        this.switchGsValueHook_.set('initial');
      } else {
        this.switchGsValueHook_.set('dropped');
      }
    }
  }

  @handle('#root').event(DomEvent.DRAGOVER)
  protected onDragover_(event: DragEvent): void {
    event.preventDefault();
    if (this.isValid_(event.dataTransfer)) {
      event.dataTransfer.dropEffect = 'copy';
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

      const {id, deleteFn} =
          this.fileService_.addBundle(ImmutableList.of(event.dataTransfer.files).toArray());
      this.deleteBundleFn_ = deleteFn;
      this.gsBundleIdHook_.set(id);
    }

    return false;
  }

  @onDom.attributeChange(BUNDLE_ID_ATTRIBUTE)
  protected onGsBundleIdChanged_(newValue: string | null, oldValue: string | null): void {
    if (this.deleteBundleFn_ !== null && oldValue !== null) {
      this.deleteBundleFn_();
    }

    const files = this.getFiles_();
    if (files === null) {
      this.switchGsValueHook_.set('initial');
      return;
    }

    this.switchGsValueHook_.set('dropped');

    // TODO: sort the file names.
    const fileNames = ImmutableList
        .of(files)
        .map((file: File) => {
          return file.name;
        })
        .toArray()
        .join(', ');
    // TODO: Differentiate between 1 attachment vs multiple.
    this.droppedMessageInnerTextHook_.set(`Added file(s): ${fileNames}`);
  }

  /**
   * Updates the display elements.
   */
  @onDom.attributeChange(LABEL_ATTRIBUTE)
  protected onGsLabelChanged_(
      @dom.attribute(LABEL_ATTRIBUTE) label: string | null): void {
    this.initialMessageInnerTextHook_.set(label || 'Drop a file here to upload');
  }
}
// TODO: Mutable
