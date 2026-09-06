/**
 * Simple message queue implementation
 */

import type { QueuedMessage } from './types';

export class MessageQueue {
  private queue: QueuedMessage[] = [];

  push(entry: QueuedMessage): void {
    this.queue.push(entry);
  }

  /** Put an entry back at the head, preserving delivery order when a send is deferred. */
  pushFront(entry: QueuedMessage): void {
    this.queue.unshift(entry);
  }

  pop(): QueuedMessage | undefined {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
