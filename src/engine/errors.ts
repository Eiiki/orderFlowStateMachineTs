/**
 * Custom errors for the workflow engine.
 */

/**
 * Thrown when attempting to operate on a node that doesn't exist.
 */
export class NodeNotFoundError extends Error {
  constructor(nodeId: string) {
    super(`Node not found: ${nodeId}`);
    this.name = "NodeNotFoundError";
  }
}

/**
 * Thrown when the engine detects potential infinite oscillation.
 * This happens when the event queue exceeds the safety limit.
 */
export class MaxEventsExceededError extends Error {
  constructor(limit: number) {
    super(`Max events limit (${limit}) exceeded - possible infinite loop in link configuration`);
    this.name = "MaxEventsExceededError";
  }
}
