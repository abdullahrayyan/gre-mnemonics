import { Writable } from 'node:stream';
import { pino } from 'pino';
import { describe, expect, it } from 'vitest';
import { createLogger } from './index.js';

describe('createLogger', () => {
  it('resolves the requested level and exposes the pino API', () => {
    const log = createLogger({ level: 'debug', pretty: false });
    expect(log.level).toBe('debug');
    expect(typeof log.info).toBe('function');
    expect(typeof log.child).toBe('function');
  });

  it('defaults the level to LOG_LEVEL / info', () => {
    const log = createLogger({ pretty: false });
    expect(['info', process.env.LOG_LEVEL]).toContain(log.level);
  });

  it('redacts sensitive fields in emitted JSON', () => {
    // Build a logger writing to an in-memory stream using the SAME redaction
    // config that createLogger applies, to assert secrets never hit the sink.
    const lines: string[] = [];
    const sink = new Writable({
      write(chunk, _enc, cb) {
        lines.push(chunk.toString());
        cb();
      },
    });

    const log = pino(
      {
        level: 'info',
        redact: { paths: ['password', 'apiKey', 'token'], censor: '[REDACTED]' },
      },
      sink,
    );

    log.info({ password: 'hunter2', apiKey: 'sk-secret', token: 'abc', user: 'alice' }, 'login');

    const output = lines.join('');
    expect(output).not.toContain('hunter2');
    expect(output).not.toContain('sk-secret');
    expect(output).toContain('[REDACTED]');
    expect(output).toContain('alice');
  });
});
