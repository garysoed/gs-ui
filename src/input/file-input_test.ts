import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {FileInput} from './file-input';


describe('input.FileInput', () => {
  let mockFileService;
  let input: FileInput;

  beforeEach(() => {
    mockFileService = jasmine.createSpyObj('FileService', ['addBundle', 'getBundle']);
    input = new FileInput(mockFileService, Mocks.object('ThemeService'));
    TestDispose.add(input);
  });

  describe('getFiles_', () => {
    it('should return the attached files', () => {
      let bundle = Mocks.object('bundle');
      mockFileService.getBundle.and.returnValue(bundle);

      let bundleId = 'bundleId';
      spyOn(input['gsBundleIdBridge_'], 'get').and.returnValue(bundleId);

      assert(input['getFiles_']()).to.equal(bundle);
      assert(mockFileService.getBundle).to.haveBeenCalledWith(bundleId);
    });

    it('should return null if there are no bundle IDs', () => {
      spyOn(input['gsBundleIdBridge_'], 'get').and.returnValue(null);

      assert(input['getFiles_']()).to.beNull();
      assert(mockFileService.getBundle).toNot.haveBeenCalled();
    });
  });

  describe('isValid_', () => {
    it('should return true if every item has one of the specified mime type', () => {
      let mimeType1 = 'mimeType1';
      let mimeType2 = 'mimeType2';

      spyOn(input['gsMimeTypesBridge_'], 'get').and.returnValue([mimeType1, mimeType2]);

      let dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.items = [{type: mimeType1}, {type: mimeType2}];

      assert(input['isValid_'](dataTransfer)).to.beTrue();
    });

    it('should return false if an item does not have any of the specified mime type', () => {
      let mimeType1 = 'mimeType1';
      let mimeType2 = 'mimeType2';

      spyOn(input['gsMimeTypesBridge_'], 'get').and.returnValue([mimeType1, mimeType2]);

      let dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.items = [{type: mimeType1}, {type: 'otherMimeType'}];

      assert(input['isValid_'](dataTransfer)).to.beFalse();
    });

    it('should return true if there are no mime types', () => {
      spyOn(input['gsMimeTypesBridge_'], 'get').and.returnValue(null);

      let dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.items = [{type: 'mimeType1'}, {type: 'mimeType2'}];

      assert(input['isValid_'](dataTransfer)).to.beTrue();
    });
  });

  describe('onDragover_', () => {
    it('should prevent default the event and set the drop effect correctly if valid', () => {
      spyOn(input, 'isValid_').and.returnValue(true);

      let dataTransfer = Mocks.object('dataTransfer');
      let mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);
      mockEvent.dataTransfer = dataTransfer;

      input['onDragover_'](mockEvent);

      assert(dataTransfer.dropEffect).to.equal('copy');
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
      assert(input['isValid_']).to.haveBeenCalledWith(dataTransfer);
    });

    it('should do nothing if not valid', () => {
      spyOn(input, 'isValid_').and.returnValue(false);

      let dataTransfer = Mocks.object('dataTransfer');
      let mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);
      mockEvent.dataTransfer = dataTransfer;

      input['onDragover_'](mockEvent);

      assert(dataTransfer.dropEffect).toNot.beDefined();
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
    });
  });

  describe('onDragEnter_', () => {
    it('should increment the drag depth and set the switch to "dragging" if data transfer is '
        + 'valid',
        () => {
          let dataTransfer = Mocks.object('dataTransfer');
          spyOn(input['switchGsValueBridge_'], 'set');
          spyOn(input, 'isValid_').and.returnValue(true);

          input['onDragEnter_'](<any> {dataTransfer: dataTransfer});

          assert(input['switchGsValueBridge_'].set).to.haveBeenCalledWith('dragging');
          assert(input['isValid_']).to.haveBeenCalledWith(dataTransfer);
          assert(input['dragDepth_']).to.equal(1);
        });

    it('should increment the drag depth and set the switch to "error" if data transfer is '
        + 'invalid',
        () => {
          let dataTransfer = Mocks.object('dataTransfer');
          spyOn(input['switchGsValueBridge_'], 'set');
          spyOn(input, 'isValid_').and.returnValue(false);

          input['onDragEnter_'](<any> {dataTransfer: dataTransfer});

          assert(input['switchGsValueBridge_'].set).to.haveBeenCalledWith('error');
          assert(input['isValid_']).to.haveBeenCalledWith(dataTransfer);
          assert(input['dragDepth_']).to.equal(1);
        });

    it('should not set the switch if drag depth is 0', () => {
      input['dragDepth_'] = -2;
      spyOn(input['switchGsValueBridge_'], 'set');
      spyOn(input, 'isValid_').and.returnValue(true);

      input['onDragEnter_'](<any> {dataTransfer: Mocks.object('dataTransfer')});

      assert(input['switchGsValueBridge_'].set).toNot.haveBeenCalled();
      assert(input['dragDepth_']).to.equal(-1);
    });
  });

  describe('onDragLeave_', () => {
    it('should decrement the drag depth and set the switch to "dropped" if there is a file',
        () => {
          spyOn(input['switchGsValueBridge_'], 'set');
          spyOn(input, 'getFiles_').and.returnValue([{}, {}]);

          input['onDragLeave_']();

          assert(input['switchGsValueBridge_'].set).to.haveBeenCalledWith('dropped');
          assert(input['dragDepth_']).to.equal(-1);
        });

    it('should decrement the drag depth and set the switch to "initial" if there are no files',
        () => {
          spyOn(input['switchGsValueBridge_'], 'set');
          spyOn(input, 'getFiles_').and.returnValue([]);

          input['onDragLeave_']();

          assert(input['switchGsValueBridge_'].set).to.haveBeenCalledWith('initial');
          assert(input['dragDepth_']).to.equal(-1);
        });

    it('should decrement the drag depth and set the switch to "initial" if there are no bundles',
        () => {
          spyOn(input['switchGsValueBridge_'], 'set');
          spyOn(input, 'getFiles_').and.returnValue(null);

          input['onDragLeave_']();

          assert(input['switchGsValueBridge_'].set).to.haveBeenCalledWith('initial');
          assert(input['dragDepth_']).to.equal(-1);
        });

    it('should not set the switch if drag dept is more than 0', () => {
      input['dragDepth_'] = 3;
      spyOn(input['switchGsValueBridge_'], 'set');

      input['onDragLeave_']();

      assert(input['switchGsValueBridge_'].set).toNot.haveBeenCalled();
      assert(input['dragDepth_']).to.equal(2);
    });
  });

  describe('onDrop_', () => {
    it('should prevent default and add the bundle correctly if valid', () => {
      let file1 = Mocks.object('file1');
      let file2 = Mocks.object('file2');
      let files = [file1, file2];
      let mockFileList = jasmine.createSpyObj('FileList', ['item']);
      mockFileList.item.and.callFake((index: number) => {
        return files[index];
      });
      mockFileList.length = 2;

      let dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.files = mockFileList;

      let mockEvent = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);
      mockEvent.dataTransfer = dataTransfer;

      let bundleId = 'bundleId';
      let deleteBundleFn = Mocks.object('deleteBundleFn');
      mockFileService.addBundle.and.returnValue({deleteFn: deleteBundleFn, id: bundleId});

      spyOn(input, 'isValid_').and.returnValue(true);
      spyOn(input['gsBundleIdBridge_'], 'set');
      spyOn(input, 'onDragLeave_');

      assert(input['onDrop_'](mockEvent)).to.beFalse();
      assert(input['onDragLeave_']).to.haveBeenCalledWith();
      assert(input['gsBundleIdBridge_'].set).to.haveBeenCalledWith(bundleId);
      assert(input['deleteBundleFn_']).to.equal(deleteBundleFn);
      assert(mockFileService.addBundle).to.haveBeenCalledWith(files);
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
      assert(input['isValid_']).to.haveBeenCalledWith(dataTransfer);
    });

    it('should delete the previous bundle if valid and exist', () => {
      let files = Mocks.object('files');
      let dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.files = files;

      let mockEvent = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);
      mockEvent.dataTransfer = dataTransfer;

      mockFileService.addBundle.and
          .returnValue({deleteFn: Mocks.object('deleteBundleFn'), id: 'bundleId'});

      let mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      input['deleteBundleFn_'] = mockDeleteBundleFn;

      spyOn(input, 'isValid_').and.returnValue(true);
      spyOn(input['gsBundleIdBridge_'], 'set');
      spyOn(input, 'onDragLeave_');

      input['onDrop_'](mockEvent);

      assert(mockDeleteBundleFn).to.haveBeenCalledWith();
    });

    it('should do nothing if not valid', () => {
      let files = Mocks.object('files');
      let dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.files = files;

      let mockEvent = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);
      mockEvent.dataTransfer = dataTransfer;

      let deleteBundleFn = Mocks.object('deleteBundleFn');
      mockFileService.addBundle.and.returnValue({deleteFn: deleteBundleFn, id: 'bundleId'});

      spyOn(input, 'isValid_').and.returnValue(false);
      spyOn(input['gsBundleIdBridge_'], 'set');
      spyOn(input, 'onDragLeave_');

      input['onDrop_'](mockEvent);

      assert(mockFileService.addBundle).toNot.haveBeenCalled();
    });
  });

  describe('onGsBundleIdChanged_', () => {
    it('should delete the previous bundle if there is a previous bundle and the old value is '
        + 'not null',
        () => {
          let mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
          input['deleteBundleFn_'] = mockDeleteBundleFn;

          spyOn(input, 'getFiles_').and.returnValue(null);
          spyOn(input['switchGsValueBridge_'], 'set');

          input['onGsBundleIdChanged_']('newValue', 'oldValue');

          assert(mockDeleteBundleFn).to.haveBeenCalledWith();
        });


    it('should not delete the previous bundle if there is a previous bundle but the old value is '
        + 'null',
        () => {
          let mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
          input['deleteBundleFn_'] = mockDeleteBundleFn;

          spyOn(input, 'getFiles_').and.returnValue(null);
          spyOn(input['switchGsValueBridge_'], 'set');

          input['onGsBundleIdChanged_']('newValue', null);

          assert(mockDeleteBundleFn).toNot.haveBeenCalled();
        });

    it('should set the switch to dropped and the dropped message correctly if there is a bundle',
        () => {
          let filename1 = 'filename1';
          let filename2 = 'filename2';
          spyOn(input, 'getFiles_').and.returnValue([{name: filename1}, {name: filename2}]);
          spyOn(input['droppedMessageInnerTextBridge_'], 'set');
          spyOn(input['switchGsValueBridge_'], 'set');

          input['onGsBundleIdChanged_']('bundleId', null);

          assert(input['droppedMessageInnerTextBridge_'].set).to
              .haveBeenCalledWith(`Added file(s): ${filename1}, ${filename2}`);
          assert(input['switchGsValueBridge_'].set).to.haveBeenCalledWith('dropped');
        });

    it('should set the switch to initial if there are no bundles', () => {
      spyOn(input, 'getFiles_').and.returnValue(null);
      spyOn(input['switchGsValueBridge_'], 'set');

      input['onGsBundleIdChanged_']('bundleId', null);

      assert(input['switchGsValueBridge_'].set).to.haveBeenCalledWith('initial');
    });
  });

  describe('onGsLabelChanged_', () => {
    it('should set the initial message correctly', () => {
      let label = 'label';
      spyOn(input['initialMessageInnerTextBridge_'], 'set');

      input['onGsLabelChanged_'](label);

      assert(input['initialMessageInnerTextBridge_'].set).to.haveBeenCalledWith(label);
    });

    it('should set the initial message to the default message if there are no labels', () => {
      spyOn(input['initialMessageInnerTextBridge_'], 'set');

      input['onGsLabelChanged_'](null);

      assert(input['initialMessageInnerTextBridge_'].set).to
          .haveBeenCalledWith(Matchers.stringMatching(/Drop a file/));
    });
  });
});

