import {TestBase} from '../test-base';
TestBase.setup();

import {BasicButton} from './basic-button';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';
import {Event} from '../const/event';
import {Mocks} from '../../external/gs_tools/src/mock';
import {TestDispose} from '../../external/gs_tools/src/testing';


describe('button.BasicButton', () => {
  let button;

  beforeEach(() => {
    button = new BasicButton();
    TestDispose.add(button);
  });

  describe('onElementClick_', () => {
    let mockListenableElement;

    beforeEach(() => {
      mockListenableElement = jasmine.createSpyObj('ListenableElement', ['dispatch']);
    });

    fit('should dispatch the ACTION vent if the element is not disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue(null);
      mockListenableElement.eventTarget = mockEventTarget;

      button['onElementClick_'](mockListenableElement);

      expect(mockListenableElement.dispatch)
          .toHaveBeenCalledWith(Event.ACTION, jasmine.any(Function));
      expect(mockEventTarget.getAttribute).toHaveBeenCalledWith('disabled');
    });

    it('should do nothing if the element is disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue('');
      mockListenableElement.eventTarget = mockEventTarget;

      button['onElementClick_'](mockListenableElement);

      expect(mockListenableElement.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      let element = Mocks.object('element');
      let mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      element.classList = mockClassList;

      let mockListenableDom = jasmine.createSpyObj('ListenableDom', ['dispose', 'on']);
      mockListenableDom.on.and.returnValue(Mocks.disposable('ListenableDom.on'));

      spyOn(ListenableDom, 'of').and.returnValue(mockListenableDom);
      spyOn(button, 'onElementClick_');

      button.onCreated(element);

      expect(mockListenableDom.on).toHaveBeenCalledWith(DomEvent.CLICK, jasmine.any(Function));

      mockListenableDom.on.calls.argsFor(0)[1]();
      expect(button['onElementClick_']).toHaveBeenCalledWith(mockListenableDom);

      expect(ListenableDom.of).toHaveBeenCalledWith(element);
      expect(mockClassList.add).toHaveBeenCalledWith('gs-action');
    });
  });
});
