/**
 * Link matching logic - determines if a Link's trigger matches an event.
 */

import type { Link } from "../domain/link";
import type { StateChanged } from "../domain/event";

/**
 * Check if a Link's trigger matches a StateChanged event.
 *
 * Matching rules:
 * - trigger.sourceId must match event.nodeId
 * - trigger.toState must match event.toState
 * - trigger.fromState (if specified) must match event.fromState
 *
 * @param link - The link to check
 * @param event - The state change event
 * @returns true if the link's trigger matches the event
 */
export function matchLink(link: Link, event: StateChanged): boolean {
  // TODO: implement
  return false;
}
