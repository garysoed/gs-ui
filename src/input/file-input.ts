/**
 * @webcomponent gs-file-input
 * Input component for uploading files.
 *
 * To use this, watch for changes to the bundle-id attribute. Whenever it changes, you can grab the
 * file and its contents using gs-ui.input.FileService.
 *
 * @attr {string} bundle-id The ID of the bundle of attached files.
 * @attr {string} label Initial message to display.
 * @attr {string[]} mime-types Array of MIME types that are acceptable.
 */
import { eventDetails, monad, monadOut } from 'external/gs_tools/src/event';
import {
  ImmutableList,
  ImmutableSet,
  Orderings } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { MonadFactory, MonadSetter, MonadValue } from 'external/gs_tools/src/interfaces';
import { ListParser, StringParser } from 'external/gs_tools/src/parse';
import { customElement, dom, domOut, onDom } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common';
import { FileService } from '../input';
import { ThemeService } from '../theming';
import { Switch } from '../tool';

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

export type DeleteBundleFn = () => void | null;
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
      @domOut.attribute(SWITCH_VALUE_ATTR) switchSetter: MonadSetter<string | null>):
      Iterable<MonadValue<any>> {
    if (deleteBundleFn !== null && oldValue !== null) {
      deleteBundleFn();
    }

    const files = this.getFiles_(bundleId);
    if (files === null || files.length === 0) {
      return ImmutableSet.of([switchSetter.set('initial')]);
    }

    const components = ImmutableList
        .of(files)
        .map((file: File) => {
          return file.name;
        })
        .sort(Orderings.natural());
    const fileNames = [...components].join(', ');
    droppedMessageEl.innerText = files.length > 1 ?
        `Added files: ${fileNames}` :
        `Added file: ${fileNames}`;
    return ImmutableSet.of([switchSetter.set('dropped')]);
  }

  @onDom.event(ROOT_EL, 'dragenter')
  onDragEnter_(
      @monadOut(DRAG_DEPTH_FACTORY) dragDepthSetter: MonadSetter<number>,
      @dom.attribute(MIME_TYPES_ATTR) mimeTypes: ImmutableList<string>,
      @domOut.attribute(SWITCH_VALUE_ATTR) switchSetter: MonadSetter<string | null>,
      @eventDetails() event: DragEvent): Iterable<MonadValue<any>> {
    const dragDepthValue = dragDepthSetter.value;
    const changes: MonadValue<any>[] = [dragDepthSetter.set(dragDepthValue + 1)];
    if (dragDepthValue >= 0) {
      if (this.isValid_(mimeTypes, event.dataTransfer)) {
        changes.push(switchSetter.set('dragging'));
      } else {
        changes.push(switchSetter.set('error'));
      }
    }

    return ImmutableSet.of(changes);
  }

  @onDom.event(ROOT_EL, 'dragleave')
  @onDom.event(ROOT_EL, 'drop')
  onDragLeave_(
      @monadOut(DRAG_DEPTH_FACTORY) dragDepthSetter: MonadSetter<number>,
      @domOut.attribute(SWITCH_VALUE_ATTR) switchSetter: MonadSetter<string | null>,
      @dom.attribute(BUNDLE_ID_ATTR) bundleId: string | null):
      Iterable<MonadValue<any>> {
    const changes: MonadValue<any>[] = [dragDepthSetter.set(dragDepthSetter.value - 1)];
    if (dragDepthSetter.value <= 1) {
      const files = this.getFiles_(bundleId);
      if (files === null || files.length <= 0) {
        changes.push(switchSetter.set('initial'));
      } else {
        changes.push(switchSetter.set('dropped'));
      }
    }

    return ImmutableSet.of(changes);
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
      @monadOut(DELETE_BUNDLE_FN_FACTORY) deleteFnSetter: MonadSetter<DeleteBundleFn | null>,
      @domOut.attribute(BUNDLE_ID_ATTR) bundleIdSetter: MonadSetter<string | null>,
      @dom.attribute(MIME_TYPES_ATTR) mimeTypes: ImmutableList<string>):
      Iterable<MonadValue<any>> {
    const changes = [];
    event.preventDefault();
    event.stopPropagation();
    if (this.isValid_(mimeTypes, event.dataTransfer)) {
      const deleteFn = deleteFnSetter.value;
      if (deleteFn !== null) {
        deleteFn();
      }

      const {id, deleteFn: newDeleteFn} =
          this.fileService_.addBundle([...ImmutableList.of(event.dataTransfer.files)]);
      changes.push(deleteFnSetter.set(newDeleteFn));
      changes.push(bundleIdSetter.set(id));
    }

    return ImmutableSet.of(changes);
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
