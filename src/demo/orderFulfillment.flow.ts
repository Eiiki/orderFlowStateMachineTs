/**
 * Order Fulfillment Flow Configuration
 *
 * Demonstrates:
 * - Workflow → Task cascade
 * - Task → Task cascade (fork/parallel)
 * - Conditional merge (multiple tasks → workflow)
 */

import { InMemoryStore } from "../storage/inMemoryStore";
import type { Link } from "../domain/link";

/**
 * Creates and configures the Order Fulfillment workflow.
 *
 * Nodes:
 * - order: PENDING → PROCESSING → READY_TO_SHIP → SHIPPED → DELIVERED
 * - verifyPayment: PENDING → IN_PROGRESS → DONE
 * - packOrder: PENDING → IN_PROGRESS → DONE
 * - createLabel: PENDING → IN_PROGRESS → DONE
 *
 * Links:
 * 1. order→PROCESSING triggers verifyPayment→IN_PROGRESS
 * 2. verifyPayment→DONE triggers packOrder + createLabel→IN_PROGRESS (fork)
 * 3. packOrder→DONE + createLabel→DONE triggers order→READY_TO_SHIP (merge)
 */
export function createOrderFulfillmentFlow(): InMemoryStore {
  const store = new InMemoryStore();

  // Create nodes
  store.addNode({ id: "order", state: "PENDING" });
  store.addNode({ id: "verifyPayment", state: "PENDING" });
  store.addNode({ id: "packOrder", state: "PENDING" });
  store.addNode({ id: "createLabel", state: "PENDING" });

  // Link 1: Start processing → begin payment verification
  const onOrderProcessing: Link = {
    id: "on-order-processing",
    trigger: { sourceId: "order", toState: "PROCESSING" },
    actions: [{ targetId: "verifyPayment", targetState: "IN_PROGRESS" }],
  };
  store.addLink(onOrderProcessing);

  // Link 2: Payment verified → fork to pack and label (parallel tasks)
  const onPaymentVerified: Link = {
    id: "on-payment-verified",
    trigger: { sourceId: "verifyPayment", toState: "DONE" },
    actions: [
      { targetId: "packOrder", targetState: "IN_PROGRESS" },
      { targetId: "createLabel", targetState: "IN_PROGRESS" },
    ],
  };
  store.addLink(onPaymentVerified);

  // Link 3a: Merge condition - triggered when packOrder becomes DONE
  const onPackDone: Link = {
    id: "on-pack-done",
    trigger: { sourceId: "packOrder", toState: "DONE" },
    guard: {
      type: "ALL_OF",
      conditions: [
        { nodeId: "packOrder", state: "DONE" },
        { nodeId: "createLabel", state: "DONE" },
      ],
    },
    actions: [{ targetId: "order", targetState: "READY_TO_SHIP" }],
  };
  store.addLink(onPackDone);

  // Link 3b: Merge condition - triggered when createLabel becomes DONE
  const onLabelDone: Link = {
    id: "on-label-done",
    trigger: { sourceId: "createLabel", toState: "DONE" },
    guard: {
      type: "ALL_OF",
      conditions: [
        { nodeId: "packOrder", state: "DONE" },
        { nodeId: "createLabel", state: "DONE" },
      ],
    },
    actions: [{ targetId: "order", targetState: "READY_TO_SHIP" }],
  };
  store.addLink(onLabelDone);

  return store;
}
