/**
 * @webcomponent gs-file-input
 * Input component for uploading files.
 *
 * To use this, watch for changes to the bundle-id attribute. Whenever it changes, you can grab the
 * file and its contents using gs-ui.input.FileService.
 *
 * @attr {string} bundle-id The ID of the bundle of attached files.
 * @attr {string} label Initial message to display.
 */
import { eventDetails, monad, monadOut, MonadSetter } from 'external/gs_tools/src/event';
import {
  ImmutableList,
  ImmutableMap,
  ImmutableSet,
  Orderings } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { MonadFactory } from 'external/gs_tools/src/interfaces';
import { ListParser, StringParser } from 'external/gs_tools/src/parse';
import { customElement, dom, domOut, onDom } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common/base-themed-element2';
import { FileService } from '../input/file-service';
import { ThemeService } from '../theming/theme-service';
import { Switch } from '../tool/switch';

const DROPPED_MESSAGE_EL = '#droppedMessage';
const INITIAL_MESSAGE_EL = '#initialMessage';
const ROOT_EL = '#root';
const SWITCH_EL = '#switch';

const BUNDLE_ID_ATTR = {name: 'bundle-id', parser: StringParser, selector: null};
const LABEL_ATTR = {name: 'label', parser: StringParser, selector: null};
const MIME_TYPES_ATTR = {name: 'mime-types', parser: ListParser(StringParser), selector: null};
const SWITCH_VALUE_ATTR = {name: 'value', parser: StringParser, selector: SWITCH_EL};

const __dragDepth = Symbol('dragDepth');
const DRAG_DEPTH_FACTORY: MonadFactory<number> = (instance: FileInput) => {

  return {
    get(): number {
      return instance[__dragDepth] || 0;
    },

    set(newValue: number): void {
      instance[__dragDepth] = newValue;
    },
  };
};

type DeleteBundleFn = () => void | null;
const __deleteBundleFn = Symbol('deleteBundleFn');
const DELETE_BUNDLE_FN_FACTORY: MonadFactory<DeleteBundleFn> = (instance: FileInput) => {
  return {
    get(): DeleteBundleFn {
      return instance[__deleteBundleFn] || null;
    },

    set(newValue: DeleteBundleFn): void {
      instance[__deleteBundleFn] = newValue;
    },
  };
};

/**
 * Component to attach files.
 */
@customElement({
  dependencies: ImmutableSet.of([FileService, Switch]),
  tag: 'gs-file-input',
  templateKey: 'src/input/file-input',
})
export class FileInput extends BaseThemedElement2 {
  constructor(
      @inject('gs.input.FileService') private readonly fileService_: FileService,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  /**
   * @return Files that have been attached, or null if there are none.
   */
  private getFiles_(bundleId: string | null): File[] | null {
    return bundleId === null ? null : this.fileService_.getBundle(bundleId);
  }

  /**
   * @param dataTransfer Data transfer object to validate.
   * @return True iff the given data transfer object is valid.
   */
  private isValid_(mimeTypesArray: ImmutableList<string>, dataTransfer: DataTransfer): boolean {
    if (mimeTypesArray.size() === 0) {
      return true;
    }
    const mimeTypesSet = new Set(mimeTypesArray);
    return ImmutableList.of(dataTransfer.items)
        .every((item: DataTransferItem) => {
          return mimeTypesSet.has(item.type);
        });
  }

  @onDom.attributeChange(BUNDLE_ID_ATTR)
  onBundleIdChanged_(
      @eventDetails() {oldValue}: {oldValue: string | null},
      @monad(DELETE_BUNDLE_FN_FACTORY) deleteBundleFn: DeleteBundleFn,
      @dom.attribute(BUNDLE_ID_ATTR) bundleId: string | null,
      @dom.element(DROPPED_MESSAGE_EL) droppedMessageEl: HTMLElement,
      @domOut.attribute(SWITCH_VALUE_ATTR) {id: switchId}: MonadSetter<string | null>):
      ImmutableMap<string, any> {
    if (deleteBundleFn !== null && oldValue !== null) {
      deleteBundleFn();
    }

    const files = this.getFiles_(bundleId);
    if (files === null || files.length === 0) {
      return ImmutableMap.of([[switchId, 'initial']]);
    }

    const fileNames = ImmutableList
        .of(files)
        .map((file: File) => {
          return file.name;
        })
        .sort(Orderings.natural())
        .toArray()
        .join(', ');
    droppedMessageEl.innerText = files.length > 1 ?
        `Added files: ${fileNames}` :
        `Added file: ${fileNames}`;
    return ImmutableMap.of([[switchId, 'dropped']]);
  }

  @onDom.event(ROOT_EL, 'dragenter')
  onDragEnter_(
      @monadOut(DRAG_DEPTH_FACTORY) {id: dragDepthId, value: dragDepth}: MonadSetter<number>,
      @dom.attribute(MIME_TYPES_ATTR) mimeTypes: ImmutableList<string>,
      @domOut.attribute(SWITCH_VALUE_ATTR) {id: switchId}: MonadSetter<string>,
      @eventDetails() event: DragEvent): ImmutableMap<string, any> {
    const map = new Map<string, any>([[dragDepthId, dragDepth + 1]]);
    if (dragDepth >= 0) {
      if (this.isValid_(mimeTypes, event.dataTransfer)) {
        map.set(switchId, 'dragging');
      } else {
        map.set(switchId, 'error');
      }
    }

    return ImmutableMap.of(map);
  }

  @onDom.event(ROOT_EL, 'dragleave')
  @onDom.event(ROOT_EL, 'drop')
  onDragLeave_(
      @monadOut(DRAG_DEPTH_FACTORY) {id: dragDepthId, value: dragDepth}: MonadSetter<number>,
      @domOut.attribute(SWITCH_VALUE_ATTR) {id: switchId}: MonadSetter<string>,
      @dom.attribute(BUNDLE_ID_ATTR) bundleId: string | null):
      ImmutableMap<string, any> {
    const map = new Map<string, any>([[dragDepthId, dragDepth - 1]]);
    if (dragDepth <= 1) {
      const files = this.getFiles_(bundleId);
      if (files === null || files.length <= 0) {
        map.set(switchId, 'initial');
      } else {
        map.set(switchId, 'dropped');
      }
    }

    return ImmutableMap.of(map);
  }

  @onDom.event(ROOT_EL, 'dragover')
  onDragover_(
      @eventDetails() event: DragEvent,
      @dom.attribute(MIME_TYPES_ATTR) mimeTypes: ImmutableList<string>): void {
    event.preventDefault();
    if (this.isValid_(mimeTypes, event.dataTransfer)) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  @onDom.event(ROOT_EL, 'drop')
  onDrop_(
      @eventDetails() event: DragEvent,
      @monadOut(DELETE_BUNDLE_FN_FACTORY)
          {id: deleteBundleId, value: deleteBundleFn}: MonadSetter<DeleteBundleFn | null>,
      @domOut.attribute(BUNDLE_ID_ATTR) {id: bundleId}: MonadSetter<string | null>,
      @dom.attribute(MIME_TYPES_ATTR) mimeTypes: ImmutableList<string>): ImmutableMap<string, any> {
    const map = new Map<string, any>();
    event.preventDefault();
    event.stopPropagation();
    if (this.isValid_(mimeTypes, event.dataTransfer)) {
      if (deleteBundleFn !== null) {
        deleteBundleFn();
      }

      const {id, deleteFn} =
          this.fileService_.addBundle(ImmutableList.of(event.dataTransfer.files).toArray());
      map.set(deleteBundleId, deleteFn);
      map.set(bundleId, id);
    }

    return ImmutableMap.of(map);
  }

  /**
   * Updates the display elements.
   */
  @onDom.attributeChange(LABEL_ATTR)
  onLabelChanged_(
      @dom.element(INITIAL_MESSAGE_EL) initialMessageEl: HTMLElement,
      @dom.attribute(LABEL_ATTR) label: string | null): void {
    initialMessageEl.innerText = label || 'Drop a file here to upload';
  }
}
