import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {DomEvent, ListenableDom} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';

import {FileService} from './file-service';


describe('input.FileService', () => {
  let service: FileService;

  beforeEach(() => {
    service = new FileService();
  });

  describe('processFile_', () => {
    it('should resolve with the file content correctly', (done: any) => {
      let mockListenableFileReader =
          jasmine.createSpyObj('ListenableFileReader', ['dispose', 'on']);
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableFileReader);

      let content = 'content';
      let mockFileReader = jasmine.createSpyObj('FileReader', ['readAsText']);
      mockFileReader.result = content;
      mockFileReader.readyState = 2;
      spyOn(service, 'createFileReader_').and.returnValue(mockFileReader);

      let file = Mocks.object('file');

      service['processFile_'](file)
          .then((actualContent: string) => {
            assert(actualContent).to.equal(content);
            assert(mockListenableFileReader.dispose).to.haveBeenCalledWith();
            done();
          }, done.fail);
      assert(mockFileReader.readAsText).to.haveBeenCalledWith(file);
      assert(ListenableDom.of).to.haveBeenCalledWith(mockFileReader);
      assert(mockListenableFileReader.on).to.haveBeenCalledWith(
          DomEvent.LOADEND,
          Matchers.any(Function),
          service);
      mockListenableFileReader.on.calls.argsFor(0)[1]();
    });

    it('should reject if the file loading ends before done loading', (done: any) => {
      let mockListenableFileReader =
          jasmine.createSpyObj('ListenableFileReader', ['dispose', 'on']);
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableFileReader);

      let mockFileReader = jasmine.createSpyObj('FileReader', ['readAsText']);
      mockFileReader.result = 'content';
      mockFileReader.readyState = 1;
      spyOn(service, 'createFileReader_').and.returnValue(mockFileReader);

      let file = Mocks.object('file');

      service['processFile_'](file)
          .then(
              done.fail,
              (error: Error) => {
                assert(error.message).to.equal(Matchers.stringMatching(/Error loading file/));
                assert(mockListenableFileReader.dispose).to.haveBeenCalledWith();
                done();
              });
      mockListenableFileReader.on.calls.argsFor(0)[1]();
    });
  });

  describe('addBundle', () => {
    it('should add the bundle correctly and return the bundle ID and the delete function', () => {
      let id1 = 'id1';
      spyOn(service['idGenerator_'], 'generate').and.returnValue(id1);

      let id2 = 'id2';
      spyOn(service['idGenerator_'], 'resolveConflict').and.returnValue(id2);

      let otherBundle = Mocks.object('otherBundle');
      service['bundles_'].set(id1, otherBundle);

      let bundle = Mocks.object('bundle');
      let {deleteFn, id} = service.addBundle(bundle);

      assert(id).to.equal(id2);
      assert(service['bundles_']).to.haveEntries([[id1, otherBundle], [id2, bundle]]);

      deleteFn();
      assert(service['bundles_']).to.haveEntries([[id1, otherBundle]]);

      assert(service['idGenerator_'].resolveConflict).to.haveBeenCalledWith(id1);
    });
  });

  describe('getBundle', () => {
    it('should return the correct bundoe of files', () => {
      let file1 = Mocks.object('file1');
      let file2 = Mocks.object('file2');
      let bundleId = 'bundleId';

      service['bundles_'].set(bundleId, [file1, file2]);

      assert(service.getBundle(bundleId)).to.equal([file1, file2]);
    });

    it('should return null if the bundle does not exist', () => {
      assert(service.getBundle('bundleId')).to.beNull();
    });
  });

  describe('processBundle', () => {
    it('should return a map of files and its corresponding content', (done: any) => {
      let bundleId = 'bundleId';

      let file1 = Mocks.object('file1');
      let file2 = Mocks.object('file2');
      let content1 = 'content1';
      let content2 = 'content2';
      spyOn(service, 'processFile_').and.callFake((file: File) => {
        switch (file) {
          case file1:
            return content1;
          case file2:
            return content2;
        }
      });
      spyOn(service, 'getBundle').and.returnValue([file1, file2]);

      service
          .processBundle(bundleId)
          .then((map: Map<File, string>) => {
            assert(map).to.haveEntries([
              [file1, content1],
              [file2, content2],
            ]);
            assert(service['processFile_']).to.haveBeenCalledWith(file1);
            assert(service['processFile_']).to.haveBeenCalledWith(file2);
            assert(service.getBundle).to.haveBeenCalledWith(bundleId);
            done();
          }, done.fail);
    });

    it('should return null if the bundle does not exist', (done: any) => {
      spyOn(service, 'getBundle').and.returnValue(null);

      service
          .processBundle('bundleId')
          .then((map: any) => {
            assert(map).to.beNull();
            done();
          }, done.fail);
    });
  });
});
