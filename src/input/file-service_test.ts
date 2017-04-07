import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { DomEvent, ListenableDom } from 'external/gs_tools/src/event';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';

import { FileService } from '../input/file-service';


describe('input.FileService', () => {
  let service: FileService;

  beforeEach(() => {
    service = new FileService();
  });

  describe('processFile_', () => {
    it('should resolve with the file content correctly', async () => {
      const mockListenableFileReader =
          jasmine.createSpyObj('ListenableFileReader', ['dispose', 'on']);
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableFileReader);

      const content = 'content';
      const mockFileReader = jasmine.createSpyObj('FileReader', ['readAsText']);
      mockFileReader.result = content;
      mockFileReader.readyState = 2;
      spyOn(service, 'createFileReader_').and.returnValue(mockFileReader);

      const file = Mocks.object('file');

      const promise = service['processFile_'](file);
      assert(mockFileReader.readAsText).to.haveBeenCalledWith(file);
      assert(ListenableDom.of).to.haveBeenCalledWith(mockFileReader);
      assert(mockListenableFileReader.on).to.haveBeenCalledWith(
          DomEvent.LOADEND,
          Matchers.any(Function),
          service);
      mockListenableFileReader.on.calls.argsFor(0)[1]();

      const actualContent = await promise;
      assert(actualContent).to.equal(content);
      assert(mockListenableFileReader.dispose).to.haveBeenCalledWith();
    });

    it('should reject if the file loading ends before done loading', async (done: any) => {
      const mockListenableFileReader =
          jasmine.createSpyObj('ListenableFileReader', ['dispose', 'on']);
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableFileReader);

      const mockFileReader = jasmine.createSpyObj('FileReader', ['readAsText']);
      mockFileReader.result = 'content';
      mockFileReader.readyState = 1;
      spyOn(service, 'createFileReader_').and.returnValue(mockFileReader);

      const file = Mocks.object('file');

      const promise = service['processFile_'](file);
      mockListenableFileReader.on.calls.argsFor(0)[1]();

      try {
        await promise;
        done.fail();
      } catch (e) {
        const error: Error = e;
        assert(error.message).to.equal(Matchers.stringMatching(/Error loading file/));
        assert(mockListenableFileReader.dispose).to.haveBeenCalledWith();
      }
    });
  });

  describe('addBundle', () => {
    it('should add the bundle correctly and return the bundle ID and the deconste function', () => {
      const id = 'id';
      spyOn(service['idGenerator_'], 'generate').and.returnValue(id);

      const otherId = 'otherId';
      const otherBundle = Mocks.object('otherBundle');
      service['bundles_'].set(otherId, otherBundle);

      const bundle = Mocks.object('bundle');
      const {deleteFn, id: actualId} = service.addBundle(bundle);

      assert(actualId).to.equal(id);
      assert(service['bundles_']).to.haveEntries([[otherId, otherBundle], [id, bundle]]);

      deleteFn();
      assert(service['bundles_']).to.haveEntries([[otherId, otherBundle]]);

      assert(service['idGenerator_'].generate).to.haveBeenCalledWith([otherId]);
    });
  });

  describe('getBundle', () => {
    it('should return the correct bundoe of files', () => {
      const file1 = Mocks.object('file1');
      const file2 = Mocks.object('file2');
      const bundleId = 'bundleId';

      service['bundles_'].set(bundleId, [file1, file2]);

      assert(service.getBundle(bundleId)).to.equal([file1, file2]);
    });

    it('should return null if the bundle does not exist', () => {
      assert(service.getBundle('bundleId')).to.beNull();
    });
  });

  describe('processBundle', () => {
    it('should return a map of files and its corresponding content', async () => {
      const bundleId = 'bundleId';

      const file1 = Mocks.object('file1');
      const file2 = Mocks.object('file2');
      const content1 = 'content1';
      const content2 = 'content2';
      Fakes.build(spyOn(service, 'processFile_'))
          .when(file1).return(content1)
          .when(file2).return(content2);
      spyOn(service, 'getBundle').and.returnValue([file1, file2]);

      const map = await service.processBundle(bundleId);
      assert(map!).to.haveEntries([
        [file1, content1],
        [file2, content2],
      ]);
      assert(service['processFile_']).to.haveBeenCalledWith(file1);
      assert(service['processFile_']).to.haveBeenCalledWith(file2);
      assert(service.getBundle).to.haveBeenCalledWith(bundleId);
    });

    it('should return null if the bundle does not exist', async () => {
      spyOn(service, 'getBundle').and.returnValue(null);

      const map = await service.processBundle('bundleId');
      assert(map).to.beNull();
    });
  });
});
