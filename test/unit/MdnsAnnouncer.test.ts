/**
 * Unit tests for the mDNS announcer
 *
 * The responder is mocked: publishing for real would put packets on the network.
 */

import { version } from '../../package.json';

interface PublishConfig {
  name: string;
  type: string;
  protocol: string;
  port: number;
  host?: string;
  txt?: Record<string, string>;
}

const HOST_NAME = 'sinricpro-aabbccddeeff';

interface Recorder {
  published: PublishConfig[];
  stopped: PublishConfig[];
}

/**
 * Load MdnsAnnouncer against a fresh module registry so each case can decide
 * whether the optional responder resolves.
 */
function withResponder(available: boolean, run: (Announcer: any, recorder: Recorder) => void) {
  const recorder: Recorder = { published: [], stopped: [] };

  jest.isolateModules(() => {
    jest.doMock(
      'bonjour-service',
      () => {
        if (!available) throw new Error('Cannot find module');

        return {
          Bonjour: class {
            publish(config: PublishConfig) {
              recorder.published.push(config);
              return { stop: () => recorder.stopped.push(config) };
            }
            destroy() {
              // no-op
            }
          },
        };
      },
      { virtual: true }
    );
    jest.doMock(
      'bonjour',
      () => {
        throw new Error('Cannot find module');
      },
      { virtual: true }
    );

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MdnsAnnouncer } = require('../../src/core/local/MdnsAnnouncer');
    run(MdnsAnnouncer, recorder);
  });
}

describe('MdnsAnnouncer', () => {
  it('should announce the documented service, host and TXT records', () => {
    withResponder(true, (MdnsAnnouncer, recorder) => {
      const announcer = new MdnsAnnouncer({ hostName: HOST_NAME });
      announcer.start(['abcdef0123456789abcdef01', 'abcdef0123456789abcdef02']);

      expect(recorder.published).toHaveLength(1);
      expect(recorder.published[0]).toMatchObject({
        name: HOST_NAME,
        type: 'sinricpro',
        protocol: 'udp',
        port: 3333,
        host: `${HOST_NAME}.local`,
        txt: {
          deviceIds: 'abcdef0123456789abcdef01,abcdef0123456789abcdef02',
          sdk: version,
          udp: '1',
        },
      });

      announcer.stop();
    });
  });

  it('should re-announce only when the device list changes', () => {
    withResponder(true, (MdnsAnnouncer, recorder) => {
      const announcer = new MdnsAnnouncer({ hostName: HOST_NAME });
      announcer.start(['abcdef0123456789abcdef01']);

      announcer.update(['abcdef0123456789abcdef01']);
      expect(recorder.published).toHaveLength(1);
      expect(recorder.stopped).toHaveLength(0);

      announcer.update(['abcdef0123456789abcdef01', 'abcdef0123456789abcdef02']);
      expect(recorder.stopped).toHaveLength(1);
      expect(recorder.published).toHaveLength(2);
      expect(recorder.published[1].txt?.deviceIds).toBe(
        'abcdef0123456789abcdef01,abcdef0123456789abcdef02'
      );

      announcer.stop();
    });
  });

  it('should degrade gracefully when no responder is installed', () => {
    withResponder(false, (MdnsAnnouncer, recorder) => {
      const announcer = new MdnsAnnouncer({ hostName: HOST_NAME });

      expect(() => announcer.start(['abcdef0123456789abcdef01'])).not.toThrow();
      expect(announcer.isAnnouncing()).toBe(false);
      expect(recorder.published).toHaveLength(0);
      expect(() => announcer.stop()).not.toThrow();
    });
  });
});
