import {
  TestAsync,
  TestDispose,
  TestInject,
  TestEvent,
  TestSetup} from '../external/gs_tools/src/testing';


const TEST_SETUP = new TestSetup([
  TestAsync,
  TestDispose,
  TestEvent,
  TestInject,
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
