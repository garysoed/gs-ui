import {
  TestAsync,
  TestDispose,
  TestInject,
  TestJasmine,
  TestSetup } from 'external/gs_tools/src/testing';


export { assert, assertColor, Matchers } from 'external/gs_tools/src/jasmine';


const TEST_SETUP = new TestSetup([
  TestAsync,
  TestDispose,
  TestInject,
  TestJasmine,
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
