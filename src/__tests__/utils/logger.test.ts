import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}));

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('log / warn / info / debug call console in development mode', async () => {
    vi.resetModules();
    vi.stubEnv('MODE', 'development');
    const { logger } = await import('../../utils/logger');

    logger.log('a');
    logger.warn('b');
    logger.info('c');
    logger.debug('d');

    expect(console.log).toHaveBeenCalledWith('a');
    expect(console.warn).toHaveBeenCalledWith('b');
    expect(console.info).toHaveBeenCalledWith('c');
    expect(console.debug).toHaveBeenCalledWith('d');
  });

  it('log is silent when MODE is not development', async () => {
    vi.resetModules();
    vi.stubEnv('MODE', 'test');
    const { logger } = await import('../../utils/logger');

    logger.log('x');

    expect(console.log).not.toHaveBeenCalled();
  });

  it('error always forwards to console.error', async () => {
    vi.resetModules();
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('PROD', false);
    const { logger } = await import('../../utils/logger');

    logger.error('fail');

    expect(console.error).toHaveBeenCalledWith('fail');
  });

  it('error sends Error instances to Sentry in production', async () => {
    vi.resetModules();
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('PROD', true);
    const Sentry = await import('@sentry/react');
    const captureMock = vi.mocked(Sentry.captureException);

    const { logger } = await import('../../utils/logger');
    const err = new Error('boom');
    logger.error('ctx', err);

    expect(console.error).toHaveBeenCalled();
    expect(captureMock).toHaveBeenCalledWith(err);
  });
});
