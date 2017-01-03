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

  describe('updateDisplay_', () => {
    it('should display the added files if exist', () => {
      let name1 = 'name1';
      let file1 = {name: name1};
      let name2 = 'name2';
      let file2 = {name: name2};

      spyOn(input, 'getFiles_').and.returnValue([file1, file2]);

      spyOn(input['messageInnerTextBridge_'], 'set');
      spyOn(input['iconInnerTextBridge_'], 'set');

      input['updateDisplay_']();

      assert(input['iconInnerTextBridge_'].set).to.haveBeenCalledWith('insert_drive_file');
      assert(input['messageInnerTextBridge_'].set).to.haveBeenCalledWith(
          Matchers.stringMatching(new RegExp(`${name1}, ${name2}`)));
    });

    it('should display the specified label if there are no files', () => {
      let label = 'label';
      spyOn(input['gsLabelBridge_'], 'get').and.returnValue(label);
      spyOn(input, 'getFiles_').and.returnValue([]);

      spyOn(input['messageInnerTextBridge_'], 'set');
      spyOn(input['iconInnerTextBridge_'], 'set');

      input['updateDisplay_']();

      assert(input['iconInnerTextBridge_'].set).to.haveBeenCalledWith('file_upload');
      assert(input['messageInnerTextBridge_'].set).to.haveBeenCalledWith(label);
    });

    it('should display the specified label if there are no bundle IDs', () => {
      let label = 'label';
      spyOn(input['gsLabelBridge_'], 'get').and.returnValue(label);
      spyOn(input, 'getFiles_').and.returnValue(null);

      spyOn(input['messageInnerTextBridge_'], 'set');
      spyOn(input['iconInnerTextBridge_'], 'set');

      input['updateDisplay_']();

      assert(input['iconInnerTextBridge_'].set).to.haveBeenCalledWith('file_upload');
      assert(input['messageInnerTextBridge_'].set).to.haveBeenCalledWith(label);
    });

    it('should display a default string if the label is not set', () => {
      spyOn(input['gsLabelBridge_'], 'get').and.returnValue(null);
      spyOn(input, 'getFiles_').and.returnValue(null);

      spyOn(input['messageInnerTextBridge_'], 'set');
      spyOn(input['iconInnerTextBridge_'], 'set');

      input['updateDisplay_']();

      assert(input['iconInnerTextBridge_'].set).to.haveBeenCalledWith('file_upload');
      assert(input['messageInnerTextBridge_'].set).to
          .haveBeenCalledWith(Matchers.stringMatching(/Drop a file/));
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
      assert(mockEvent.preventDefault).toNot.haveBeenCalled();
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

      let mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);
      mockEvent.dataTransfer = dataTransfer;

      let bundleId = 'bundleId';
      let deleteBundleFn = Mocks.object('deleteBundleFn');
      mockFileService.addBundle.and.returnValue({deleteFn: deleteBundleFn, id: bundleId});

      spyOn(input, 'isValid_').and.returnValue(true);
      spyOn(input['gsBundleIdBridge_'], 'set');

      input['onDrop_'](mockEvent);

      assert(input['gsBundleIdBridge_'].set).to.haveBeenCalledWith(bundleId);
      assert(input['deleteBundleFn_']).to.equal(deleteBundleFn);
      assert(mockFileService.addBundle).to.haveBeenCalledWith(files);
      assert(mockEvent.preventDefault).to.haveBeenCalledWith();
      assert(input['isValid_']).to.haveBeenCalledWith(dataTransfer);
    });

    it('should delete the previous bundle if valid and exist', () => {
      let files = Mocks.object('files');
      let dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.files = files;

      let mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);
      mockEvent.dataTransfer = dataTransfer;

      mockFileService.addBundle.and
          .returnValue({deleteFn: Mocks.object('deleteBundleFn'), id: 'bundleId'});

      let mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
      input['deleteBundleFn_'] = mockDeleteBundleFn;

      spyOn(input, 'isValid_').and.returnValue(true);
      spyOn(input['gsBundleIdBridge_'], 'set');

      input['onDrop_'](mockEvent);

      assert(mockDeleteBundleFn).to.haveBeenCalledWith();
    });

    it('should do nothing if not valid', () => {
      let files = Mocks.object('files');
      let dataTransfer = Mocks.object('dataTransfer');
      dataTransfer.files = files;

      let mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);
      mockEvent.dataTransfer = dataTransfer;

      let deleteBundleFn = Mocks.object('deleteBundleFn');
      mockFileService.addBundle.and.returnValue({deleteFn: deleteBundleFn, id: 'bundleId'});

      spyOn(input, 'isValid_').and.returnValue(false);
      spyOn(input['gsBundleIdBridge_'], 'set');

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

          spyOn(input, 'updateDisplay_');

          input['onGsBundleIdChanged_']('newValue', 'oldValue');

          assert(mockDeleteBundleFn).to.haveBeenCalledWith();
          assert(input['updateDisplay_']).to.haveBeenCalledWith();
        });


    it('should not delete the previous bundle if there is a previous bundle but the old value is '
        + 'null',
        () => {
          let mockDeleteBundleFn = jasmine.createSpy('DeleteBundleFn');
          input['deleteBundleFn_'] = mockDeleteBundleFn;

          spyOn(input, 'updateDisplay_');

          input['onGsBundleIdChanged_']('newValue', null);

          assert(mockDeleteBundleFn).toNot.haveBeenCalled();
          assert(input['updateDisplay_']).to.haveBeenCalledWith();
        });

    it('should not throw error if there is no previous bundle', () => {
      spyOn(input, 'updateDisplay_');

      assert(() => {
        input['onGsBundleIdChanged_']('newValue', 'oldValue');
      }).toNot.throw();
    });
  });
});

