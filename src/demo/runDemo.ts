/**
 * Demo runner - executes the Order Fulfillment flow and prints trace.
 */

import { WorkflowEngine } from "../engine/workflowEngine";
import { formatTrace } from "../engine/trace";
import { createOrderFulfillmentFlow } from "./orderFulfillment.flow";

/**
 * Run the Order Fulfillment demo.
 *
 * Simulates:
 * 1. Start processing the order
 * 2. Payment verification completes
 * 3. Pack order completes
 * 4. Create label completes → triggers merge to READY_TO_SHIP
 * 5. Ship the order
 * 6. Deliver the order
 */
function runDemo(): void {
  console.log("=== Order Fulfillment Demo ===\n");

  // Set up the flow
  const store = createOrderFulfillmentFlow();
  const engine = new WorkflowEngine(store);

  // Execute a step: update state, then print the trace and current states
  const step = (description: string, nodeId: string, newState: string) => {
    console.log(`--- ${description} ---`);
    const trace = engine.updateState(nodeId, newState);
    console.log(formatTrace(trace));
    console.log(`States: ${JSON.stringify(engine.getAllStates())}\n`);
  };

  // Run the flow
  step("1. Start processing", "order", "PROCESSING");
  step("2. Payment verified", "verifyPayment", "DONE");
  step("3. Pack order complete", "packOrder", "DONE");
  step("4. Label created (triggers merge)", "createLabel", "DONE");
  step("5. Ship order", "order", "SHIPPED");
  step("6. Deliver order", "order", "DELIVERED");

  console.log("=== Demo Complete ===");
}

// Run if executed directly
runDemo();
