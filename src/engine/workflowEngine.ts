/**
 * WorkflowEngine - the main orchestration loop for state propagation.
 */

import type { InMemoryStore } from "../storage/inMemoryStore";
import type { StateChanged } from "../domain/event";
import type { NodeId, State } from "../domain/types";
import type { TraceEntry } from "./trace";
import { matchLink } from "./linkMatcher";
import { evaluateGuard } from "./guardEvaluator";
import { MaxEventsExceededError } from "./errors";

/** Default maximum events to process before assuming infinite loop */
const DEFAULT_MAX_EVENTS = 1000;

/**
 * Configuration options for the WorkflowEngine.
 */
export interface WorkflowEngineOptions {
  /** Maximum events to process in a single updateState call (default: 1000) */
  maxEvents?: number;
}

/**
 * WorkflowEngine orchestrates state changes and cascades through Links.
 *
 * Algorithm:
 * 1. Apply initial state change, emit StateChanged event
 * 2. Add event to queue
 * 3. While queue is not empty:
 *    a. Dequeue event
 *    b. Find all Links triggered by this event
 *    c. For each matching Link:
 *       - Evaluate Guard (if present)
 *       - If Guard passes, apply actions
 *       - Each action may produce new StateChanged events
 *    d. Add new events to queue
 * 4. Return trace of all state changes
 */
export class WorkflowEngine {
  private store: InMemoryStore;
  private maxEvents: number;

  constructor(store: InMemoryStore, options: WorkflowEngineOptions = {}) {
    this.store = store;
    this.maxEvents = options.maxEvents ?? DEFAULT_MAX_EVENTS;
  }

  /**
   * Update a node's state and process all cascading changes.
   *
   * @param nodeId - The node to update
   * @param newState - The new state value
   * @returns Array of trace entries showing all state changes that occurred
   */
  updateState(nodeId: NodeId, newState: State): TraceEntry[] {
    const trace: TraceEntry[] = [];
    const queue: Array<{ event: StateChanged; triggeredBy?: string }> = [];

    // Apply initial state change
    const initialEvent = this.store.setNodeState(nodeId, newState);
    if (!initialEvent) {
      return []; // No change
    }

    // Add to trace and queue
    trace.push({ event: initialEvent });
    queue.push({ event: initialEvent });

    // Process queue until empty
    while (queue.length > 0) {
      // Safety check
      if (trace.length > this.maxEvents) {
        throw new MaxEventsExceededError(this.maxEvents);
      }

      const { event } = queue.shift()!;

      // Find links that could be triggered by this event
      const links = this.store.getLinksForSource(event.nodeId);

      for (const link of links) {
        // Check if link's trigger matches this event
        if (!matchLink(link, event)) {
          continue;
        }

        // Check guard if present
        if (link.guard && !evaluateGuard(link.guard, this.store)) {
          continue;
        }

        // Apply all actions
        for (const action of link.actions) {
          const actionEvent = this.store.setNodeState(
            action.targetId,
            action.targetState
          );

          // Only add to trace/queue if state actually changed
          if (actionEvent) {
            const entry: TraceEntry = {
              event: actionEvent,
              triggeredBy: link.id,
            };
            trace.push(entry);
            queue.push({ event: actionEvent, triggeredBy: link.id });
          }
        }
      }
    }

    return trace;
  }

  /**
   * Get a snapshot of all current node states.
   */
  getAllStates(): Record<NodeId, State> {
    const states: Record<NodeId, State> = {};
    for (const node of this.store.listNodes()) {
      states[node.id] = node.state;
    }
    return states;
  }
}
