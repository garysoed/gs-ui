import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableList } from 'external/gs_tools/src/immutable';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { FileInput } from '../input/file-input';


describe('input.FileInput', () => {
  let mockFileService: any;
  let input: FileInput;

  beforeEach(() => {
    mockFileService = jasmine.createSpyObj('FileService', ['addBundle', 'getBundle']);
    input = new FileInput(mockFileService, Mocks.object('ThemeService'));
    TestDispose.add(input);
  });

  describe('getFiles_', () => {
    it('should return the attached files', () => {
      const bundle = Mocks.object('bundle');
      mockFileService.getBundle.and.returnValue(bundle);

      const bundleId = 'bundleId';
      assert(input['getFiles_'](bundleId)).to.equal(bundle);
      assert(mockFileService.getBundle).to.haveBeenCalledWith(bundleId);
    });

    it('should return null if there are no bundle IDs', () => {
      assert(input['getFiles_'](null)).to.beNull();
      assert(mockFileService.getBundle).toNot.haveBeenCalled();
    });
  });

  describe('isValid_', () => {
    it('should return true if every item has one of the specified mime type', () => {
      const mimeType1 = 'mimeType1';
      const mimeType2 = 'mimeType2';

      const dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.items = [{type: mimeType1}, {type: mimeType2}];

      assert(input['isValid_'](ImmutableList.of([mimeType1, mimeType2]), dataTransfer)).to.beTrue();
    });

    it('should return false if an item does not have any of the specified mime type', () => {
      const mimeType1 = 'mimeType1';
      const mimeType2 = 'mimeType2';

      const dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.items = [{type: mimeType1}, {type: 'otherMimeType'}];

      assert(input['isValid_'](ImmutableList.of([mimeType1, mimeType2]), dataTransfer))
          .to.beFalse();
    });

    it('should return true if there are no mime types', () => {
      const dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.items = [{type: 'mimeType1'}, {type: 'mimeType2'}];

      assert(input['isValid_'](ImmutableList.of([]), dataTransfer)).to.beTrue();
    });
  });

  describe('onBundleIdChanged_', () => {
    it(`should update the text correctly for multiple files`, () => {
      const mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      const bundleId = 'bundleId';
      const droppedMessageEl = Mocks.object('droppedMessageEl');
      const switchId = 'switchId';

      const filename1 = 'filename1';
      const filename2 = 'filename2';
      spyOn(input, 'getFiles_').and.returnValue([{name: filename1}, {name: filename2}]);

      const map = input.onBundleIdChanged_(
          {oldValue: 'oldValue'} as any,
          mockDeleteBundleFn,
          bundleId,
          droppedMessageEl,
          {id: switchId} as any);
      assert(map).to.haveElements([[switchId, 'dropped']]);
      assert(droppedMessageEl.innerText as string).to
          .match(new RegExp(`files: ${filename1}, ${filename2}`));
      assert(input['getFiles_']).to.haveBeenCalledWith(bundleId);
    });

    it(`should update the text correctly for one file`, () => {
      const mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      const bundleId = 'bundleId';
      const droppedMessageEl = Mocks.object('droppedMessageEl');
      const switchId = 'switchId';

      const filename = 'filename';
      spyOn(input, 'getFiles_').and.returnValue([{name: filename}]);

      const map = input.onBundleIdChanged_(
          {oldValue: 'oldValue'} as any,
          mockDeleteBundleFn,
          bundleId,
          droppedMessageEl,
          {id: switchId} as any);
      assert(map).to.haveElements([[switchId, 'dropped']]);
      assert(droppedMessageEl.innerText as string).to.match(new RegExp(`file: ${filename}`));
      assert(input['getFiles_']).to.haveBeenCalledWith(bundleId);
    });

    it(`should switch the state to initial if there are no files`, () => {
      const mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      const bundleId = 'bundleId';
      const droppedMessageEl = Mocks.object('droppedMessageEl');
      const switchId = 'switchId';

      spyOn(input, 'getFiles_').and.returnValue([]);

      const map = input.onBundleIdChanged_(
          {oldValue: 'oldValue'} as any,
          mockDeleteBundleFn,
          bundleId,
          droppedMessageEl,
          {id: switchId} as any);
      assert(map).to.haveElements([[switchId, 'initial']]);
      assert(input['getFiles_']).to.haveBeenCalledWith(bundleId);
    });

    it(`should switch the state to initial if there are no bundles`, () => {
      const mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      const bundleId = 'bundleId';
      const droppedMessageEl = Mocks.object('droppedMessageEl');
      const switchId = 'switchId';

      spyOn(input, 'getFiles_').and.returnValue(null);

      const map = input.onBundleIdChanged_(
          {oldValue: 'oldValue'} as any,
          mockDeleteBundleFn,
          bundleId,
          droppedMessageEl,
          {id: switchId} as any);
      assert(map).to.haveElements([[switchId, 'initial']]);
      assert(input['getFiles_']).to.haveBeenCalledWith(bundleId);
    });

    it(`should delete the previous bundle if there is a previous bundle and the old value is ' +
        'not null`, () => {
      const mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      const bundleId = 'bundleId';
      const droppedMessageEl = Mocks.object('droppedMessageEl');
      const switchId = 'switchId';

      spyOn(input, 'getFiles_').and.returnValue(null);

      input.onBundleIdChanged_(
          {oldValue: 'oldValue'} as any,
          mockDeleteBundleFn,
          bundleId,
          droppedMessageEl,
          {id: switchId} as any);
      assert(mockDeleteBundleFn).to.haveBeenCalledWith();
    });

    it('should not delete the previous bundle if there is a previous bundle but the old value is '
        + 'null', () => {
      const mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      const bundleId = 'bundleId';
      const droppedMessageEl = Mocks.object('droppedMessageEl');
      const switchId = 'switchId';

      spyOn(input, 'getFiles_').and.returnValue(null);

      input.onBundleIdChanged_(
          {oldValue: null} as any,
          mockDeleteBundleFn,
          bundleId,
          droppedMessageEl,
          {id: switchId} as any);
      assert(mockDeleteBundleFn).toNot.haveBeenCalled();
    });
  });

  describe('onDragEnter_', () => {
    it('should increment the drag depth and set the switch to "dragging" if data transfer is '
        + 'valid',
        () => {
          const switchId = 'switchId';
          const mimeTypes = Mocks.object('mimeTypes');
          const dragDepthId = 'dragDepthId';
          const dragDepth = 123;
          const dataTransfer = Mocks.object('dataTransfer');
          spyOn(input, 'isValid_').and.returnValue(true);

          const map = input.onDragEnter_(
              {id: dragDepthId, value: dragDepth},
              mimeTypes,
              {id: switchId} as any,
              {dataTransfer: dataTransfer} as any);
          assert(map).to.haveElements([[dragDepthId, dragDepth + 1], [switchId, 'dragging']]);

          assert(input['isValid_']).to.haveBeenCalledWith(mimeTypes, dataTransfer);
        });

    it('should increment the drag depth and set the switch to "error" if data transfer is '
        + 'invalid',
        () => {
          const switchId = 'switchId';
          const mimeTypes = Mocks.object('mimeTypes');
          const dragDepthId = 'dragDepthId';
          const dragDepth = 123;
          const dataTransfer = Mocks.object('dataTransfer');
          spyOn(input, 'isValid_').and.returnValue(false);

          const map = input.onDragEnter_(
              {id: dragDepthId, value: dragDepth},
              mimeTypes,
              {id: switchId} as any,
              {dataTransfer: dataTransfer} as any);
          assert(map).to.haveElements([[dragDepthId, dragDepth + 1], [switchId, 'error']]);

          assert(input['isValid_']).to.haveBeenCalledWith(mimeTypes, dataTransfer);
        });

    it('should not set the switch if drag depth is < 0', () => {
      const switchId = 'switchId';
      const mimeTypes = Mocks.object('mimeTypes');
      const dragDepthId = 'dragDepthId';
      const dragDepth = -1;
      const dataTransfer = Mocks.object('dataTransfer');
      spyOn(input, 'isValid_').and.returnValue(false);

      const map = input.onDragEnter_(
          {id: dragDepthId, value: dragDepth},
          mimeTypes,
          {id: switchId} as any,
          {dataTransfer: dataTransfer} as any);
      assert(map).to.haveElements([[dragDepthId, dragDepth + 1]]);
    });
  });

  describe('onDragLeave_', () => {
    it('should decrement the drag depth and set the switch to "dropped" if there is a file',
        () => {
          const dragDepthId = 'dragDepthId';
          const dragDepth = 1;
          const switchId = 'switchId';
          const bundleId = 'bundleId';
          spyOn(input, 'getFiles_').and.returnValue([{}, {}]);

          const map = input.onDragLeave_(
              {id: dragDepthId, value: dragDepth},
              {id: switchId} as any,
              bundleId);
          assert(map).to.haveElements([[dragDepthId, dragDepth - 1], [switchId, 'dropped']]);
          assert(input['getFiles_']).to.haveBeenCalledWith(bundleId);
        });

    it('should decrement the drag depth and set the switch to "initial" if there are no files',
        () => {
          const dragDepthId = 'dragDepthId';
          const dragDepth = 1;
          const switchId = 'switchId';
          const bundleId = 'bundleId';
          spyOn(input, 'getFiles_').and.returnValue([]);

          const map = input.onDragLeave_(
              {id: dragDepthId, value: dragDepth},
              {id: switchId} as any,
              bundleId);
          assert(map).to.haveElements([[dragDepthId, dragDepth - 1], [switchId, 'initial']]);
          assert(input['getFiles_']).to.haveBeenCalledWith(bundleId);
        });

    it('should decrement the drag depth and set the switch to "initial" if there are no bundles',
        () => {
          const dragDepthId = 'dragDepthId';
          const dragDepth = 1;
          const switchId = 'switchId';
          const bundleId = 'bundleId';
          spyOn(input, 'getFiles_').and.returnValue(null);

          const map = input.onDragLeave_(
              {id: dragDepthId, value: dragDepth},
              {id: switchId} as any,
              bundleId);
          assert(map).to.haveElements([[dragDepthId, dragDepth - 1], [switchId, 'initial']]);
          assert(input['getFiles_']).to.haveBeenCalledWith(bundleId);
        });

    it('should not set the switch if drag depth is more than 1', () => {
      const dragDepthId = 'dragDepthId';
      const dragDepth = 123;
      const switchId = 'switchId';
      const bundleId = 'bundleId';
      spyOn(input, 'getFiles_').and.returnValue(null);

      const map = input.onDragLeave_(
          {id: dragDepthId, value: dragDepth},
          {id: switchId} as any,
          bundleId);
      assert(map).to.haveElements([[dragDepthId, dragDepth - 1]]);
    });
  });

  describe('onDragover_', () => {
    it('should prevent default the event and set the drop effect correctly if valid', () => {
      spyOn(input, 'isValid_').and.returnValue(true);

      const mimeTypes = Mocks.object('mimeTypes');
      const dataTransfer = Mocks.object('dataTransfer');
      const mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);
      mockEvent.dataTransfer = dataTransfer;

      input.onDragover_(mockEvent, mimeTypes);

      assert(dataTransfer.dropEffect).to.equal('copy');
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
      assert(input['isValid_']).to.haveBeenCalledWith(mimeTypes, dataTransfer);
    });

    it('should do nothing if not valid', () => {
      spyOn(input, 'isValid_').and.returnValue(false);

      const mimeTypes = Mocks.object('mimeTypes');
      const dataTransfer = Mocks.object('dataTransfer');
      const mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);
      mockEvent.dataTransfer = dataTransfer;

      input.onDragover_(mockEvent, mimeTypes);

      assert(dataTransfer.dropEffect).toNot.beDefined();
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
      assert(input['isValid_']).to.haveBeenCalledWith(mimeTypes, dataTransfer);
    });
  });

  describe('onDrop_', () => {
    it('should prevent default and add the bundle correctly if valid', () => {
      const deleteBundleId = 'deleteBundleId';
      const bundleId = 'bundleId';
      const mimeTypes = Mocks.object('mimeTypes');
      const file1 = Mocks.object('file1');
      const file2 = Mocks.object('file2');
      const files = [file1, file2];
      const mockFileList = jasmine.createSpyObj('FileList', ['item']);
      Fakes.build(mockFileList.item).call((index: number) => {
        return files[index];
      });
      mockFileList.length = 2;

      const dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.files = mockFileList;

      const mockEvent = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);
      mockEvent.dataTransfer = dataTransfer;

      const newBundleId = 'bundleId';
      const deleteBundleFn = Mocks.object('deleteBundleFn');
      mockFileService.addBundle.and.returnValue({deleteFn: deleteBundleFn, id: newBundleId});

      spyOn(input, 'isValid_').and.returnValue(true);
      spyOn(input, 'onDragLeave_');

      const map = input.onDrop_(
          mockEvent,
          {id: deleteBundleId, value: null},
          {id: bundleId} as any,
          mimeTypes);
      assert(map).to.haveElements([[deleteBundleId, deleteBundleFn], [bundleId, newBundleId]]);
      assert(mockFileService.addBundle).to.haveBeenCalledWith(files);
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
      assert(input['isValid_']).to.haveBeenCalledWith(mimeTypes, dataTransfer);
    });

    it('should delete the previous bundle if valid and exist', () => {
      const deleteBundleId = 'deleteBundleId';
      const bundleId = 'bundleId';
      const mimeTypes = Mocks.object('mimeTypes');
      const file1 = Mocks.object('file1');
      const file2 = Mocks.object('file2');
      const files = [file1, file2];
      const mockFileList = jasmine.createSpyObj('FileList', ['item']);
      Fakes.build(mockFileList.item).call((index: number) => {
        return files[index];
      });
      mockFileList.length = 2;

      const dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.files = mockFileList;

      const mockEvent = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);
      mockEvent.dataTransfer = dataTransfer;

      const newBundleId = 'bundleId';
      const deleteBundleFn = Mocks.object('deleteBundleFn');
      mockFileService.addBundle.and.returnValue({deleteFn: deleteBundleFn, id: newBundleId});

      spyOn(input, 'isValid_').and.returnValue(true);
      spyOn(input, 'onDragLeave_');

      const mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      const map = input.onDrop_(
          mockEvent,
          {id: deleteBundleId, value: mockDeleteBundleFn},
          {id: bundleId} as any,
          mimeTypes);
      assert(map).to.haveElements([[deleteBundleId, deleteBundleFn], [bundleId, newBundleId]]);
      assert(mockFileService.addBundle).to.haveBeenCalledWith(files);
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
      assert(input['isValid_']).to.haveBeenCalledWith(mimeTypes, dataTransfer);
      assert(mockDeleteBundleFn).to.haveBeenCalledWith();
    });

    it('should do nothing if not valid', () => {
      const bundleId = 'bundleId';
      const mimeTypes = Mocks.object('mimeTypes');
      const dataTransfer = Mocks.object('dataTransfer');

      const mockEvent = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);
      mockEvent.dataTransfer = dataTransfer;

      const newBundleId = 'bundleId';
      const deleteBundleFn = Mocks.object('deleteBundleFn');
      mockFileService.addBundle.and.returnValue({deleteFn: deleteBundleFn, id: newBundleId});

      spyOn(input, 'isValid_').and.returnValue(false);
      spyOn(input, 'onDragLeave_');

      const mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      const map = input.onDrop_(
          mockEvent,
          {id: 'deleteBundleId', value: mockDeleteBundleFn},
          {id: bundleId} as any,
          mimeTypes);
      assert(map).to.haveElements([]);
      assert(mockFileService.addBundle).toNot.haveBeenCalled();
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
      assert(input['isValid_']).to.haveBeenCalledWith(mimeTypes, dataTransfer);
      assert(mockDeleteBundleFn).toNot.haveBeenCalled();
    });
  });

  describe('onLabelChanged_', () => {
    it('should set the initial message correctly', () => {
      const label = 'label';
      const initialMessageEl = Mocks.object('initialMessageEl');

      input.onLabelChanged_(initialMessageEl, label);

      assert(initialMessageEl.innerText).to.equal(label);
    });

    it('should set the initial message to the default message if there are no labels', () => {
      const initialMessageEl = Mocks.object('initialMessageEl');

      input.onLabelChanged_(initialMessageEl, null);

      assert(initialMessageEl.innerText as string).to.match(/Drop a file/);
    });
  });
});

