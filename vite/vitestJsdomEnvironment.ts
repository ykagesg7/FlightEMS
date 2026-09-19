import { builtinEnvironments } from 'vitest/environments';
import type { Environment } from 'vitest/environments';

const jsdom = builtinEnvironments.jsdom;

type AbortGlobals = {
  AbortController: typeof AbortController;
  AbortSignal: typeof AbortSignal;
  window?: {
    AbortController: typeof AbortController;
    AbortSignal: typeof AbortSignal;
  };
};

/**
 * jsdom has AbortController but no Request. Vitest then leaves Node/undici
 * Request on the test global. Node 24 brand-checks `RequestInit.signal`
 * against the Node AbortSignal, so React Router data-router navigations
 * throw and never leave the previous page (Planning stays mounted).
 */
function restoreNodeAbort(global: AbortGlobals, native: AbortGlobals): void {
  global.AbortController = native.AbortController;
  global.AbortSignal = native.AbortSignal;
  if (global.window) {
    global.window.AbortController = native.AbortController;
    global.window.AbortSignal = native.AbortSignal;
  }
}

const vitestJsdomEnvironment: Environment = {
  name: 'jsdom',
  transformMode: 'web',
  async setupVM(options) {
    const result = await jsdom.setupVM!(options);
    const vmWindow = result.getVmContext() as AbortGlobals;
    restoreNodeAbort(vmWindow, {
      AbortController,
      AbortSignal,
    });
    return result;
  },
  async setup(global, options) {
    const host = global as AbortGlobals;
    const native = {
      AbortController: host.AbortController,
      AbortSignal: host.AbortSignal,
    };
    const result = await jsdom.setup(global, options);
    restoreNodeAbort(host, native);
    return result;
  },
};

export default vitestJsdomEnvironment;
