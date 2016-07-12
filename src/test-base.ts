import {TestAsync, TestDispose, TestEvent, TestSetup} from '../external/gs_tools/src/testing';


const TEST_SETUP = new TestSetup([
  TestAsync,
  TestDispose,
  TestEvent,
]);

let initialized = false;

export const TestBase = {
  setup(): void {
    if (!initialized) {
      TEST_SETUP.setup();
      initialized = true;
    }
  },
};
