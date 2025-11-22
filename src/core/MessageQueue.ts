/**
 * Simple message queue implementation
 */

export class MessageQueue {
  private queue: string[] = [];

  push(message: string): void {
    this.queue.push(message);
  }

  pop(): string | undefined {
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
