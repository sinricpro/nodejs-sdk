/**
 * Host network helpers shared by the websocket client and local control
 */

import os from 'os';

const NO_MAC = '00:00:00:00:00:00';

/**
 * MAC address of the first non-internal network interface.
 * @returns MAC address string in format XX:XX:XX:XX:XX:XX
 */
export function getMacAddress(): string {
  for (const netInterfaces of Object.values(os.networkInterfaces())) {
    if (!netInterfaces) continue;

    for (const net of netInterfaces) {
      if (!net.internal && net.mac && net.mac !== NO_MAC) {
        return net.mac.toUpperCase();
      }
    }
  }

  return NO_MAC;
}

/**
 * mDNS host name for this machine: `sinricpro-<mac, lowercase, no separators>`.
 */
export function getMdnsHostName(): string {
  return `sinricpro-${getMacAddress().replace(/[:-]/g, '').toLowerCase()}`;
}

/**
 * IPv4 addresses of every non-internal interface.
 *
 * A host commonly has several (Docker, VPN, WSL) and the multicast group has to
 * be joined on each of them, or discovery answers on the wrong network.
 */
export function getLocalIPv4Addresses(): string[] {
  const addresses: string[] = [];

  for (const netInterfaces of Object.values(os.networkInterfaces())) {
    if (!netInterfaces) continue;

    for (const net of netInterfaces) {
      if (net.internal) continue;
      // Node <18.4 reports family as 'IPv4', newer versions as 4
      if (net.family !== 'IPv4' && (net.family as unknown as number) !== 4) continue;
      addresses.push(net.address);
    }
  }

  return addresses;
}
