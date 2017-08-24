import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';

import { DownloadService } from '../tool/download-service';


describe('tool.DownloadService', () => {
  let window: any;
  let service: DownloadService;

  beforeEach(() => {
    window = Mocks.object('window');
    service = new DownloadService(window);
  });

  describe('download', () => {
    it('should initiate the download correctly', () => {
      const blob = Mocks.object('blob');
      const url = 'url';
      const mockUrl = jasmine.createSpyObj('Url', ['createObjectURL', 'revokeObjectURL']);
      mockUrl.createObjectURL.and.returnValue(url);
      window.URL = mockUrl;

      const mockLinkEl = jasmine.createSpyObj('LinkEl', ['click']);
      spyOn(service, 'getLinkEl_').and.returnValue(mockLinkEl);

      const filename = 'filename';

      service.download(blob, filename);
      assert(mockUrl.revokeObjectURL).to.haveBeenCalledWith(url);
      assert(mockLinkEl.click).to.haveBeenCalledWith();
      assert(mockLinkEl.href).to.equal(url);
      assert(mockLinkEl.download).to.equal(filename);
      assert(mockUrl.createObjectURL).to.haveBeenCalledWith(blob);
    });
  });

  describe('downloadJson', () => {
    it('should initiate the download correctly', () => {
      const json = Mocks.object('json');
      const filename = 'filename';
      const blob = Mocks.object('blob');
      spyOn(service, 'createBlob_').and.returnValue(blob);
      spyOn(service, 'download');

      service.downloadJson(json, filename);
      assert(service.download).to.haveBeenCalledWith(blob, filename);
      assert(service['createBlob_']).to.haveBeenCalledWith(
          [JSON.stringify(json, null)],
          {type: 'application/json'});
    });
  });

  describe('downloadString', () => {
    it(`should initiate the download correctly`, () => {
      const str = 'str';
      const filename = 'filename';
      const blob = Mocks.object('blob');
      spyOn(service, 'createBlob_').and.returnValue(blob);
      spyOn(service, 'download');

      service.downloadString(str, filename);
      assert(service.download).to.haveBeenCalledWith(blob, filename);
      assert(service['createBlob_']).to.haveBeenCalledWith(
          [str],
          {type: 'text/plain'});
    });
  });

  describe('getLinkEl_', () => {
    it('should create a new instance of the link element correctly', () => {
      const linkEl = Mocks.object('linkEl');
      const mockDocument = jasmine.createSpyObj('Document', ['createElement']);
      mockDocument.createElement.and.returnValue(linkEl);
      window.document = mockDocument;

      assert(service['getLinkEl_']()).to.equal(linkEl);
      assert(linkEl.target).to.equal('_blank');
      assert(mockDocument.createElement).to.haveBeenCalledWith('a');
    });
  });
});
