/**
 * In-memory storage for Nodes and Links.
 *
 * Isolates state management from engine logic, providing controlled mutations
 * and a single source of truth for all node states.
 */

import type { Node } from "../domain/node";
import type { Link } from "../domain/link";
import type { StateChanged } from "../domain/event";
import type { NodeId, State } from "../domain/types";
import { NodeNotFoundError } from "../engine/errors";

/**
 * In-memory store for workflow state.
 *
 * Holds all Nodes and Links for a workflow, providing:
 * - Node lookup by id
 * - State updates with change detection
 * - Link lookup by trigger source
 */
export class InMemoryStore {
  private nodes: Map<NodeId, Node> = new Map();
  private links: Link[] = [];

  /**
   * Add a node to the store.
   * Overwrites if a node with the same id already exists.
   */
  addNode(node: Node): void {
    // TODO: implement
  }

  /**
   * Get a node by id.
   * @returns The node, or undefined if not found
   */
  getNode(id: NodeId): Node | undefined {
    // TODO: implement
    return undefined;
  }

  /**
   * Update a node's state.
   *
   * This is the ONLY place where node state should be mutated.
   * Returns a StateChanged event if the state actually changed,
   * or null if the new state equals the current state (no-op).
   *
   * @param id - The node to update
   * @param newState - The new state value
   * @returns StateChanged event if state changed, null if unchanged
   * @throws NodeNotFoundError if node doesn't exist
   */
  setNodeState(id: NodeId, newState: State): StateChanged | null {
    // TODO: implement
    throw new NodeNotFoundError(id);
  }

  /**
   * Get all links that could be triggered by a state change on the given node.
   *
   * Used by the engine to find which Links to evaluate after a state change.
   *
   * @param sourceId - The node that changed state
   * @returns Links with trigger.sourceId matching the given id
   */
  getLinksForSource(sourceId: NodeId): Link[] {
    // TODO: implement
    return [];
  }

  /**
   * Add a link to the store.
   */
  addLink(link: Link): void {
    // TODO: implement
  }

  /**
   * Get all nodes in the store.
   * Useful for getting a snapshot of all states.
   */
  listNodes(): Node[] {
    // TODO: implement
    return [];
  }
}
